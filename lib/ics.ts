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

/**
 * Does the event's SUMMARY match the filter string (case-insensitive)?
 *
 * The filter string may contain comma-separated terms. A match is returned if
 * the SUMMARY contains ANY of the terms (OR semantics). Commas let users write
 * filters like "standup, lunch" to match either word.
 *
 * Back-compat guarantees:
 * - A single comma-less term (the common case) behaves identically to before:
 *   one trim→one substring check.
 * - An empty string, all-whitespace, or all-commas string produces zero terms
 *   and returns false (callers guard with `if (filter && ...)`, so no filter =
 *   match-all / drop-none is preserved at the call site).
 */
export function summaryMatches(eventLines: string[], filter: string): boolean {
  const terms = filter
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (terms.length === 0) return false;
  const summary = unescapeText(getProp(eventLines, "SUMMARY") ?? "").toLowerCase();
  return terms.some((t) => summary.includes(t.toLowerCase()));
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

export interface PerFeedOptions {
  /** Prepend this string to every SUMMARY from this feed. */
  prefix?: string;
  /** Mask only this feed's events to "Busy". */
  busyOnly?: boolean;
  /** Drop all-day VEVENTs (DATE-valued DTSTART) from this feed. */
  hideAllDay?: boolean;
  /**
   * Per-feed include keyword: only events whose SUMMARY contains this string
   * (case-insensitive) are kept from this feed. Empty/absent = match-all.
   * Same semantics as the global include field.
   */
  include?: string;
  /**
   * Per-feed exclude keyword: events whose SUMMARY contains this string
   * (case-insensitive) are dropped from this feed. Empty/absent = drop-none.
   * Same semantics as the global exclude field.
   */
  exclude?: string;
}

export interface MergeInput {
  calendars: ParsedCalendar[];
  options: BlendOptions;
  /**
   * Optional per-feed options parallel to calendars[]. Length must match
   * calendars[] (or be omitted/shorter — missing entries default to no
   * per-feed options).
   */
  perFeedOptions?: PerFeedOptions[];
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
/** Return true if the VEVENT's DTSTART is a DATE (all-day, no time component). */
function isAllDayEvent(eventLines: string[]): boolean {
  const dtLine = getPropLine(eventLines, "DTSTART");
  if (!dtLine) return false;
  // DATE value: either explicit VALUE=DATE param or bare 8-digit form
  if (/VALUE=DATE[^-]/.test(dtLine) || /VALUE=DATE$/.test(dtLine)) return true;
  const value = dtLine.slice(valueColonIndex(dtLine) + 1);
  return /^\d{8}$/.test(value);
}

export function mergeCalendars(input: MergeInput): string {
  const { calendars, options, perFeedOptions = [], failedSources = [], calendarName } = input;
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

  // --- PRIVACY-WINS pre-scan ---
  // For cross-feed deduplication: if the SAME event appears in multiple feeds
  // AND any of those feeds is masked, the output event MUST be masked.
  //
  // Identity rules (UID-first):
  //   - Two events are the "same event" only if they share a UID.
  //   - The DTSTART+SUMMARY content-key fallback is used ONLY when BOTH events
  //     lack a UID. Events with DIFFERENT UIDs are NEVER collapsed.
  //
  // In this pre-scan we record masked UIDs (and masked anonymous content-keys
  // for UID-less events) so we can privacy-wins force-mask survivors later.
  const maskedUids = new Set<string>(); // UIDs that appear in a masked feed
  const maskedAnonKeys = new Set<string>(); // DTSTART+SUMMARY keys for UID-less events in masked feeds
  let anonPre = 0;
  for (let i = 0; i < calendars.length; i++) {
    const feedOpts: PerFeedOptions = perFeedOptions[i] ?? {};
    const feedEffectiveBusy = options.busyOnly === true || feedOpts.busyOnly === true;
    if (!feedEffectiveBusy) continue; // only care about masked feeds in this pass
    for (const ev of calendars[i].events) {
      if (feedOpts.hideAllDay && isAllDayEvent(ev)) continue;
      const rawUidLine = getPropLine(ev, "UID");
      const rawUid = rawUidLine ? rawUidLine.slice(valueColonIndex(rawUidLine) + 1) : "";
      if (rawUid) {
        // Has UID — record it so matching UIDs in unmasked feeds are also masked.
        maskedUids.add(rawUid);
      } else {
        // No UID — use content key for the UID-less fallback only.
        const dtstart = getProp(ev, "DTSTART") ?? "";
        const summary = getProp(ev, "SUMMARY") ?? "";
        anonPre += 1;
        if (dtstart && summary) {
          maskedAnonKeys.add(`${dtstart}\0${summary}`.toLowerCase());
        }
      }
    }
  }

  // Deduplicate events — UID-FIRST identity:
  //   - Primary key: UID. Two events with DIFFERENT UIDs are NEVER collapsed,
  //     even if they share the same DTSTART+SUMMARY. Events with distinct UIDs
  //     are genuinely different events (e.g. US vs Canada "New Year's Day").
  //   - Content-key fallback (DTSTART+SUMMARY): ONLY when BOTH the current event
  //     AND the previously-seen duplicate LACK a UID. This handles providers that
  //     publish the same public holiday / recurring event without UIDs.
  //   - Dedup identity is always computed from the ORIGINAL (pre-mask) event so
  //     masking never changes which events survive.
  const seenUids = new Set<string>();
  const seenAnonContentKeys = new Set<string>(); // only for UID-less events
  let anon = 0;
  for (let i = 0; i < calendars.length; i++) {
    const feedOpts: PerFeedOptions = perFeedOptions[i] ?? {};
    // Per-feed busy: effective if EITHER global or per-feed flag is set.
    const feedEffectiveBusy = options.busyOnly === true || feedOpts.busyOnly === true;

    for (const ev of calendars[i].events) {
      // Per-feed: drop all-day events from this feed if hideAllDay is set.
      if (feedOpts.hideAllDay && isAllDayEvent(ev)) continue;

      // Per-feed keyword filters (applied before global filters; compose with AND).
      // Empty/absent = no filter (match-all for include, drop-none for exclude).
      if (feedOpts.include && !summaryMatches(ev, feedOpts.include)) continue;
      if (feedOpts.exclude && summaryMatches(ev, feedOpts.exclude)) continue;

      // Global keyword filters.
      if (options.include && !summaryMatches(ev, options.include)) continue;
      if (options.exclude && summaryMatches(ev, options.exclude)) continue;

      // Compute dedup keys from the ORIGINAL event (before busy-mask).
      const rawUidLine = getPropLine(ev, "UID");
      const rawUid = rawUidLine ? rawUidLine.slice(valueColonIndex(rawUidLine) + 1) : "";
      const dtstart = getProp(ev, "DTSTART") ?? "";
      const summary = getProp(ev, "SUMMARY") ?? "";

      // Content-key for UID-less fallback and privacy-wins lookup.
      const contentKey = `${dtstart}\0${summary}`.toLowerCase();

      if (rawUid) {
        // Event HAS a UID: dedup only on UID — never collapse with a different UID.
        if (seenUids.has(rawUid)) continue;
        seenUids.add(rawUid);
      } else {
        // Event has NO UID: assign a synthetic one AND dedup by content key
        // (DTSTART+SUMMARY) to collapse genuinely-duplicate UID-less events.
        anon += 1;
        if (contentKey && seenAnonContentKeys.has(contentKey)) continue;
        if (contentKey) seenAnonContentKeys.add(contentKey);
      }

      // PRIVACY-WINS: if this event's UID appears in ANY masked feed (or, for
      // UID-less events, if the same content-key appears in a masked feed),
      // the survivor must be masked regardless of which feed it came from.
      const identityIsMasked =
        feedEffectiveBusy ||
        (rawUid ? maskedUids.has(rawUid) : (contentKey ? maskedAnonKeys.has(contentKey) : false));

      // Assign a canonical UID for output tracking.
      const canonicalUid = rawUid || `blend-anon-${i + 1}-${anon}@ical-blend`;

      // Apply busy mask to this event if needed.
      let out = identityIsMasked ? busyMask(ev) : [...ev];

      // Apply prefix: prepend to SUMMARY with exactly ONE space separator.
      // Trim any trailing whitespace off the stored prefix then add one space,
      // so "[Work] " and "[Work]" both yield "[Work] Title" / "[Work] Busy".
      if (feedOpts.prefix) {
        const prefixStr = feedOpts.prefix.trimEnd() + " ";
        out = out.map((l) => {
          if (propName(l) === "SUMMARY") {
            const idx = valueColonIndex(l);
            if (idx >= 0) {
              const currentValue = l.slice(idx + 1);
              return `SUMMARY:${prefixStr}${currentValue}`;
            }
          }
          return l;
        });
      }

      // Fix the UID in the output lines.
      const outUidLine = getPropLine(out, "UID");
      if (!rawUid) {
        // Insert the generated UID.
        out = out.flatMap((l) =>
          l.toUpperCase() === "BEGIN:VEVENT" ? [l, `UID:${canonicalUid}`] : [l]
        );
      } else if (identityIsMasked) {
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
