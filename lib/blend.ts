/** Fetch source feeds and produce the merged ICS document. */
import type { BlendConfig } from "./config";
import { normalizeSource } from "./config";
import { mergeCalendars, parseCalendar, type ParsedCalendar, type PerFeedOptions } from "./ics";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 1024 * 1024; // 1 MB per source
const USER_AGENT = "ical-blend/1.0 (+https://ical-blend.vercel.app)";

async function fetchSource(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Request timed out after 8 s")), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/calendar, text/plain, */*" },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new Error("Source exceeds 1 MB cap");
    const text = new TextDecoder("utf-8").decode(buf);
    if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error("Not an ICS document");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export interface BlendResult {
  ics: string;
  failedSources: number[]; // 1-based indices
  /** Human-readable reason for each failed source, keyed by 1-based index. */
  failedReasons: Record<number, string>;
}

/** Map a fetch error message to a user-readable reason string. */
function friendlyFetchError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  // AbortError from AbortSignal.timeout
  if (msg.includes("abort") || msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("timed out")) {
    return "timed out after 8 s — the source may be slow or unavailable";
  }
  // HTTP status codes
  const httpMatch = msg.match(/HTTP (\d+)/i);
  if (httpMatch) {
    const code = Number(httpMatch[1]);
    if (code === 429) return "HTTP 429 — rate limited by the source server (try again in a few minutes)";
    if (code === 404) return "HTTP 404 — feed URL not found";
    if (code === 401 || code === 403) return `HTTP ${code} — access denied (the feed may require auth)`;
    if (code === 500) return "HTTP 500 — source server error";
    if (code >= 400 && code < 500) return `HTTP ${code} — source rejected the request`;
    if (code >= 500) return `HTTP ${code} — source server error`;
    return `HTTP ${code}`;
  }
  if (msg.includes("Not an ICS")) return "URL doesn't point to an ICS calendar file";
  if (msg.includes("1 MB")) return "calendar file too large (over 1 MB)";
  return msg.slice(0, 100);
}

/** Fetch all sources concurrently; failures become a marker event, not an error. */
export async function buildBlend(config: BlendConfig): Promise<BlendResult> {
  // Normalize all source entries (supports both legacy string[] and new SourceConfig[]).
  const normalizedSources = config.sources.map(normalizeSource);
  const results = await Promise.allSettled(
    normalizedSources.map((src) => fetchSource(src.url))
  );
  const calendars: ParsedCalendar[] = [];
  const failedSources: number[] = [];
  const failedReasons: Record<number, string> = {};
  const perFeedOptions: PerFeedOptions[] = [];

  results.forEach((r, i) => {
    const src = normalizedSources[i];
    if (r.status === "fulfilled") {
      calendars.push(parseCalendar(r.value));
      perFeedOptions.push({
        prefix: src.prefix,
        busyOnly: src.busyOnly,
        hideAllDay: src.hideAllDay,
      });
    } else {
      const idx1 = i + 1;
      failedSources.push(idx1);
      failedReasons[idx1] = friendlyFetchError(r.reason);
    }
  });

  const ics = mergeCalendars({
    calendars,
    options: {
      include: config.include,
      exclude: config.exclude,
      busyOnly: config.busyOnly,
    },
    perFeedOptions,
    failedSources,
    calendarName: "iCal Blend",
  });
  return { ics, failedSources, failedReasons };
}
