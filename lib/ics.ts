/**
 * Minimal RFC 5545 line-based ICS handling: unfold, parse components,
 * filter, busy-mask, merge, re-fold, emit.
 */

export interface ParsedCalendar {
  /** Each VEVENT as an array of unfolded lines (BEGIN/END included). */
  events: string[][];
  /** Each VTIMEZONE as an array of unfolded lines (BEGIN/END included). */
  timezones: string[][];
}

export interface BlendOptions {
  include?: string;
  exclude?: string;
  busyOnly?: boolean;
}

/** Unfold ICS content into logical lines (folded continuations joined). */
export function unfold(text: string): string[] {
  const raw = text.split(/\r?\n/);
  const lines: string[] = [];
  for (const l of raw) {
    if ((l.startsWith(" ") || l.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += l.slice(1);
    } else if (l.length > 0) {
      lines.push(l);
    }
  }
  return lines;
}

/** Fold a single logical line to <=75 octets per line, UTF-8 safe. */
export function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  let first = true;
  while (i < bytes.length) {
    // Continuation lines start with one space, leaving 74 octets of payload.
    const limit = first ? 75 : 74;
    let end = Math.min(i + limit, bytes.length);
    // Do not split a UTF-8 multibyte sequence.
    while (end > i + 1 && end < bytes.length && (bytes[end] & 0xc0) === 0x80) {
      end--;
    }
    parts.push((first ? "" : " ") + bytes.subarray(i, end).toString("utf8"));
    i = end;
    first = false;
  }
  return parts.join("\r\n");
}

/** Property name of an unfolded content line (before first ';' or ':'). */
export function propName(line: string): string {
  const m = line.match(/^([A-Za-z0-9-]+)/);
  return m ? m[1].toUpperCase() : "";
}

/** Index of the value-separating ':' (skips ':' inside quoted params). */
function valueColonIndex(line: string): number {
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ":" && !inQuotes) return i;
  }
  return -1;
}

/** Value of the first property with the given name, raw (still escaped). */
export function getProp(lines: string[], name: string): string | undefined {
  const upper = name.toUpperCase();
  for (const l of lines) {
    if (propName(l) === upper) {
      const idx = valueColonIndex(l);
      if (idx >= 0) return l.slice(idx + 1);
    }
  }
  return undefined;
}

/** Full first line (with params) of a property, or undefined. */
export function getPropLine(lines: string[], name: string): string | undefined {
  const upper = name.toUpperCase();
  return lines.find((l) => propName(l) === upper);
}

/** Unescape an ICS TEXT value for display. */
export function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/** Escape a string for use as an ICS TEXT value. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Parse an ICS document into VEVENT and VTIMEZONE blocks. */
export function parseCalendar(text: string): ParsedCalendar {
  const lines = unfold(text);
  const events: string[][] = [];
  const timezones: string[][] = [];
  let current: string[] | null = null;
  let currentEnd = "";
  for (const line of lines) {
    if (current) {
      current.push(line);
      if (line.toUpperCase() === currentEnd) {
        if (currentEnd === "END:VEVENT") events.push(current);
        else timezones.push(current);
        current = null;
      }
      continue;
    }
    const u = line.toUpperCase();
    if (u === "BEGIN:VEVENT") {
      current = [line];
      currentEnd = "END:VEVENT";
    } else if (u === "BEGIN:VTIMEZONE") {
      current = [line];
      currentEnd = "END:VTIMEZONE";
    }
  }
  return { events, timezones };
}

/** Does the event's SUMMARY contain the keyword (case-insensitive)? */
export function summaryMatches(eventLines: string[], keyword: string): boolean {
  const summary = getProp(eventLines, "SUMMARY") ?? "";
  return unescapeText(summary).toLowerCase().includes(keyword.toLowerCase());
}

const BUSY_STRIP = new Set([
  "SUMMARY",
  "DESCRIPTION",
  "LOCATION",
  "ATTENDEE",
  "ORGANIZER",
  "URL",
]);

/**
 * Apply the busy-only mask: SUMMARY becomes "Busy"; DESCRIPTION, LOCATION,
 * ATTENDEE, ORGANIZER and URL are removed; VALARM subcomponents (which can
 * carry descriptions) are dropped. DTSTART/DTEND etc. are preserved.
 * The UID is NOT modified here; callers are responsible for replacing it
 * with an opaque hash (busyHashUid) to prevent identity leaks.
 */
export function busyMask(eventLines: string[]): string[] {
  const out: string[] = [];
  let inAlarm = false;
  for (const line of eventLines) {
    const u = line.toUpperCase();
    if (u === "BEGIN:VALARM") {
      inAlarm = true;
      continue;
    }
    if (inAlarm) {
      if (u === "END:VALARM") inAlarm = false;
      continue;
    }
    if (BUSY_STRIP.has(propName(line))) continue;
    if (u === "END:VEVENT") out.push("SUMMARY:Busy");
    out.push(line);
  }
  return out;
}

/**
 * Under the busy-only mask, replace a UID with an opaque deterministic hash
 * so calendar clients can still deduplicate across refreshes, but the
 * original event identity is non-reversible.
 * Uses a simple djb2-style hash encoded as hex for zero external dependencies.
 */
export function busyHashUid(uid: string): string {
  // FNV-1a 32-bit hash, hex-encoded — deterministic, non-reversible
  let h = 0x811c9dc5;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return `busy-${h.toString(16).padStart(8, "0")}@ical-blend`;
}

/** Parse common ICS date/date-time value forms into a Date (approximate for TZID/floating). */
export function parseIcsDate(value: string): Date | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(
    Date.UTC(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h ?? 0),
      Number(mi ?? 0),
      Number(s ?? 0)
    )
  );
}

function tzid(timezoneLines: string[]): string {
  return getProp(timezoneLines, "TZID") ?? timezoneLines.join("\n");
}

export interface MergeInput {
  calendars: ParsedCalendar[];
  options: BlendOptions;
  /** 1-based indices of sources that failed to fetch. */
  failedSources?: number[];
  calendarName?: string;
}

/**
 * Merge parsed calendars into one VCALENDAR document (CRLF, folded lines).
 * Applies include/exclude SUMMARY filters and the busy-only mask, dedupes
 * VTIMEZONEs by TZID, keeps UIDs unique across sources, and appends an
 * all-day marker VEVENT when sources failed.
 */
export function mergeCalendars(input: MergeInput): string {
  const { calendars, options, failedSources = [], calendarName } = input;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//iCal Blend//ical-blend 1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName ?? "iCal Blend")}`,
  ];

  const seenTz = new Set<string>();
  for (const cal of calendars) {
    for (const tz of cal.timezones) {
      const id = tzid(tz);
      if (seenTz.has(id)) continue;
      seenTz.add(id);
      lines.push(...tz);
    }
  }

  // Deduplicate events: primary key = UID; fallback = DTSTART+SUMMARY when
  // UIDs are absent. Under busy-only, also build a DTSTART+SUMMARY key to
  // catch events whose UIDs differ but content is identical (e.g. holiday
  // feeds using per-provider UIDs for the same public holiday).
  const seenUids = new Set<string>();
  const seenDtStartSummary = new Set<string>();
  let anon = 0;
  for (let i = 0; i < calendars.length; i++) {
    for (const ev of calendars[i].events) {
      if (options.include && !summaryMatches(ev, options.include)) continue;
      if (options.exclude && summaryMatches(ev, options.exclude)) continue;

      // Compute dedup keys from the ORIGINAL event (before busy-mask).
      const rawUidLine = getPropLine(ev, "UID");
      const rawUid = rawUidLine ? rawUidLine.slice(valueColonIndex(rawUidLine) + 1) : "";
      const dtstart = getProp(ev, "DTSTART") ?? "";
      const summary = getProp(ev, "SUMMARY") ?? "";
      const contentKey = `${dtstart}\0${summary}`.toLowerCase();

      // Assign an anonymous UID when absent, so we can track it.
      let canonicalUid = rawUid;
      if (!canonicalUid) {
        anon += 1;
        canonicalUid = `blend-anon-${i + 1}-${anon}@ical-blend`;
      }

      // Dedup: skip if we've seen this UID OR the same DTSTART+SUMMARY combo.
      if (seenUids.has(canonicalUid)) continue;
      if (contentKey && seenDtStartSummary.has(contentKey)) continue;

      seenUids.add(canonicalUid);
      if (contentKey) seenDtStartSummary.add(contentKey);

      let out = options.busyOnly ? busyMask(ev) : [...ev];

      // Fix the UID in the output lines.
      const outUidLine = getPropLine(out, "UID");
      if (!rawUid) {
        // Insert the generated UID.
        out = out.flatMap((l) =>
          l.toUpperCase() === "BEGIN:VEVENT" ? [l, `UID:${canonicalUid}`] : [l]
        );
      } else if (options.busyOnly) {
        // Replace original UID with an opaque hash to prevent identity leaks.
        const hashedUid = busyHashUid(canonicalUid);
        out = out.map((l) => (l === outUidLine ? `UID:${hashedUid}` : l));
      }
      // (Non-busy, UID present: keep original UID verbatim — already unique due to dedup.)

      lines.push(...out);
    }
  }

  if (failedSources.length > 0) {
    const now = new Date();
    const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const n = failedSources.length;
    lines.push(
      "BEGIN:VEVENT",
      `UID:blend-failed-${ymd(now)}-${failedSources.join("-")}@ical-blend`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(now)}`,
      `DTEND;VALUE=DATE:${ymd(tomorrow)}`,
      `SUMMARY:iCal Blend: ${n} source${n === 1 ? "" : "s"} failed`,
      `DESCRIPTION:${escapeText(
        `Source${n === 1 ? "" : "s"} ${failedSources.join(", ")} of your blend ` +
          `could not be fetched. Events from the remaining sources are included.`
      )}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export interface PreviewEvent {
  summary: string;
  start: string | null;
  allDay: boolean;
}

/** Extract the next `limit` upcoming events (by DTSTART) from merged ICS text. */
export function upcomingEvents(icsText: string, limit = 10): PreviewEvent[] {
  const { events } = parseCalendar(icsText);
  const now = Date.now() - 24 * 60 * 60 * 1000; // include today's all-day events
  const parsed = events
    .map((ev) => {
      const dtLine = getPropLine(ev, "DTSTART");
      const value = dtLine ? dtLine.slice(valueColonIndex(dtLine) + 1) : "";
      const date = value ? parseIcsDate(value) : null;
      return {
        summary: unescapeText(getProp(ev, "SUMMARY") ?? "(no title)"),
        start: date ? date.toISOString() : null,
        allDay: /^\d{8}$/.test(value),
        ts: date ? date.getTime() : Number.MAX_SAFE_INTEGER,
      };
    })
    .filter((e) => e.ts >= now)
    .sort((a, b) => a.ts - b.ts)
    .slice(0, limit);
  return parsed.map(({ summary, start, allDay }) => ({ summary, start, allDay }));
}
