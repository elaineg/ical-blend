/** Fetch source feeds and produce the merged ICS document. */
import type { BlendConfig } from "./config";
import { mergeCalendars, parseCalendar, type ParsedCalendar } from "./ics";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 1024 * 1024; // 1 MB per source
const USER_AGENT = "ical-blend/1.0 (+https://ical-blend.vercel.app)";

async function fetchSource(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
}

export interface BlendResult {
  ics: string;
  failedSources: number[]; // 1-based indices
}

/** Fetch all sources concurrently; failures become a marker event, not an error. */
export async function buildBlend(config: BlendConfig): Promise<BlendResult> {
  const results = await Promise.allSettled(config.sources.map(fetchSource));
  const calendars: ParsedCalendar[] = [];
  const failedSources: number[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") calendars.push(parseCalendar(r.value));
    else failedSources.push(i + 1);
  });
  const ics = mergeCalendars({
    calendars,
    options: {
      include: config.include,
      exclude: config.exclude,
      busyOnly: config.busyOnly,
    },
    failedSources,
    calendarName: "iCal Blend",
  });
  return { ics, failedSources };
}
