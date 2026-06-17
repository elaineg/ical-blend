import { NextResponse } from "next/server";
import { validateConfig, normalizeSource } from "@/lib/config";
import { buildBlend } from "@/lib/blend";
import { upcomingEvents } from "@/lib/ics";
import { encryptConfig, getKeyFromEnv } from "@/lib/token";

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

  let key: Buffer;
  try {
    key = getKeyFromEnv();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server misconfigured: ENCRYPTION_KEY is not set." },
      { status: 500 }
    );
  }

  // Build the blend at create time to get event count and surface failures.
  const { ics, failedSources, failedReasons } = await buildBlend(result.config);
  const events = upcomingEvents(ics, 10);

  // Count all events in the merged ICS (not just upcoming).
  const { parseCalendar } = await import("@/lib/ics");
  const { events: allEvents } = parseCalendar(ics);
  const totalEventCount = allEvents.length;

  const normalizedSources = result.config.sources.map(normalizeSource);
  const feedsLabelled = normalizedSources.filter((s) => s.prefix).length;
  const feedsMasked = normalizedSources.filter((s) => s.busyOnly).length;

  const token = encryptConfig(result.config, key);
  return NextResponse.json({
    token,
    feedPath: `/api/feed/${token}`,
    failedSources,
    failedReasons,
    totalEventCount,
    previewEvents: events,
    applied: {
      include: result.config.include ?? null,
      exclude: result.config.exclude ?? null,
      busyOnly: result.config.busyOnly === true,
      sourceCount: result.config.sources.length,
      feedsLabelled,
      feedsMasked,
    },
  });
}
