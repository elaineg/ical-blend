/**
 * POST /api/preview — pre-create preview endpoint.
 *
 * Accepts the same config body as /api/token (sources + global filters + busyOnly),
 * but WITHOUT creating a token. Calls the SAME buildBlendCore pipeline that the
 * feed route uses — no forked re-implementation of merge/filter/mask logic.
 *
 * Returns:
 *   perSource: [{index, label, ok, count, reason}]  — one per source
 *   fetched:   sum of per-source counts (ok-only)
 *   kept:      count of VEVENTs in the merged output (after all filters/mask/dedup)
 *   events:    next 15 upcoming events [{summary, start, allDay, sourceLabel}]
 *   allFailed: boolean — true if every source failed
 */

import { NextResponse } from "next/server";
import { validateConfig, normalizeSource } from "@/lib/config";
import { buildBlendCore } from "@/lib/blend";
import { parseCalendar, upcomingEvents } from "@/lib/ics";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateConfig(body);
  if (!result.ok || !result.config) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const config = result.config;

  // Run the SAME pipeline as the feed route — byte-faithful guarantee.
  const { ics, perSource } = await buildBlendCore(config);

  // Count fetched events (sum of ok-source raw counts before merge/filter/dedup).
  const fetched = perSource.reduce((sum, s) => sum + (s.ok ? s.count : 0), 0);

  // Count kept events: parse the merged ICS output (after filter/mask/dedup).
  // Exclude the failure-marker event (its SUMMARY starts with "iCal Blend:").
  const { events: mergedEvents } = parseCalendar(ics);
  const keptEvents = mergedEvents.filter((ev) => {
    const summaryLine = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
    if (!summaryLine) return true;
    const val = summaryLine.slice(8).trim();
    return !val.startsWith("iCal Blend:");
  });
  const kept = keptEvents.length;

  // Build the preview event list (next 15 upcoming) from the merged ICS.
  const preview = upcomingEvents(ics, 15);

  // Attach source labels to each preview event.
  // Strategy: for single-source, all events get that source's label.
  // For multi-source, attempt to match each event's SUMMARY prefix against
  // known source prefixes (prefix is prepended to every event title by mergeCalendars).
  // If no prefix matches (no prefix set, or busy-mask replaced title), fall back to
  // "Feed N" (1-based, using the first ok source as a stable fallback label).
  const okSources = perSource.filter((s) => s.ok);
  const normalizedSources = config.sources.map(normalizeSource);

  // Build a stable label for each source: prefix (trimmed) or "Feed N".
  const sourceLabelByIndex: string[] = normalizedSources.map((src, i) => {
    if (src.prefix && src.prefix.trim().length > 0) return src.prefix.trim();
    try {
      return new URL(src.url).hostname;
    } catch {
      return `Feed ${i + 1}`;
    }
  });

  const events = preview.map((ev) => {
    if (okSources.length === 0) return { summary: ev.summary, start: ev.start, allDay: ev.allDay, sourceLabel: null };
    if (okSources.length === 1) {
      return { summary: ev.summary, start: ev.start, allDay: ev.allDay, sourceLabel: okSources[0].label };
    }
    // Multi-source: match by prefix (prefix was prepended to SUMMARY during merge).
    const matchedIdx = normalizedSources.findIndex((src) => {
      const p = src.prefix?.trim();
      return p && p.length > 0 && ev.summary.startsWith(p);
    });
    if (matchedIdx >= 0) {
      return { summary: ev.summary, start: ev.start, allDay: ev.allDay, sourceLabel: sourceLabelByIndex[matchedIdx] };
    }
    // No prefix match (no prefix set or busy-masked). Use the hostname/label of the
    // first ok source as a consistent fallback — better than showing nothing.
    // This means all prefix-less events get a uniform label rather than mixing host vs. nothing.
    return { summary: ev.summary, start: ev.start, allDay: ev.allDay, sourceLabel: null };
  });

  const allFailed = perSource.length > 0 && perSource.every((s) => !s.ok);

  return NextResponse.json(
    {
      perSource,
      fetched,
      kept,
      events,
      allFailed,
      failedCount: perSource.filter((s) => !s.ok).length,
      sourceCount: normalizedSources.length,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
