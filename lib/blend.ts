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

/**
 * Per-source fetch result — used by the preview API to surface live status.
 * 0-based index in the sources array; label is prefix or URL host.
 */
export interface SourceFetchResult {
  index: number;   // 0-based
  label: string;   // prefix or URL host
  ok: boolean;
  /** Number of VEVENTs fetched (only meaningful when ok=true). */
  count: number;
  /** Human-readable failure reason (only meaningful when ok=false). */
  reason: string;
}

/** Map a fetch error message to a user-readable short reason string. */
export function friendlyFetchError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  // AbortError from AbortSignal.timeout
  if (msg.includes("abort") || msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("timed out")) {
    return "timed out";
  }
  // HTTP status codes
  const httpMatch = msg.match(/HTTP (\d+)/i);
  if (httpMatch) {
    const code = Number(httpMatch[1]);
    if (code === 429) return "rate limited — try again later";
    if (code === 404) return "feed not found (404)";
    if (code === 401 || code === 403) return "needs a login — not a public feed";
    if (code === 500) return "source server error (500)";
    if (code >= 400 && code < 500) return `source rejected the request (${code})`;
    if (code >= 500) return `source server error (${code})`;
    return `HTTP ${code}`;
  }
  if (msg.includes("Not an ICS")) return "not a calendar feed";
  if (msg.includes("1 MB")) return "calendar file too large (over 1 MB)";
  return msg.slice(0, 80);
}

/** Derive a short display label from a source (prefix or hostname). */
function sourceLabel(url: string, prefix?: string): string {
  if (prefix && prefix.trim().length > 0) return prefix.trim();
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 40);
  }
}

/**
 * Core fetch+merge pipeline shared by buildBlend (feed route) and buildPreview (preview route).
 * Returns per-source results alongside the merged ICS so the preview route can surface them.
 */
export interface CoreBlendResult {
  ics: string;
  failedSources: number[]; // 1-based indices
  failedReasons: Record<number, string>;
  /** Per-source fetch results (0-based), for the preview API. */
  perSource: SourceFetchResult[];
}

/** Fetch all sources concurrently; failures become a marker event, not an error. */
export async function buildBlend(config: BlendConfig): Promise<BlendResult> {
  const core = await buildBlendCore(config);
  return {
    ics: core.ics,
    failedSources: core.failedSources,
    failedReasons: core.failedReasons,
  };
}

/**
 * Full pipeline: fetch all sources, merge, return ICS + per-source status.
 * Called by buildBlend (feed route) and directly by the preview route.
 */
export async function buildBlendCore(config: BlendConfig): Promise<CoreBlendResult> {
  // Normalize all source entries (supports both legacy string[] and new SourceConfig[]).
  const normalizedSources = config.sources.map(normalizeSource);
  const fetchResults = await Promise.allSettled(
    normalizedSources.map((src) => fetchSource(src.url))
  );
  const calendars: ParsedCalendar[] = [];
  const failedSources: number[] = [];
  const failedReasons: Record<number, string> = {};
  const perFeedOptions: PerFeedOptions[] = [];
  const perSource: SourceFetchResult[] = [];

  fetchResults.forEach((r, i) => {
    const src = normalizedSources[i];
    const label = sourceLabel(src.url, src.prefix);
    if (r.status === "fulfilled") {
      const cal = parseCalendar(r.value);
      calendars.push(cal);
      perFeedOptions.push({
        prefix: src.prefix,
        busyOnly: src.busyOnly,
        hideAllDay: src.hideAllDay,
        include: src.include,
        exclude: src.exclude,
      });
      perSource.push({ index: i, label, ok: true, count: cal.events.length, reason: "" });
    } else {
      const idx1 = i + 1;
      failedSources.push(idx1);
      const reason = friendlyFetchError(r.reason);
      failedReasons[idx1] = reason;
      perSource.push({ index: i, label, ok: false, count: 0, reason });
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
  return { ics, failedSources, failedReasons, perSource };
}
