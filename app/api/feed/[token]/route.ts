import { NextResponse } from "next/server";
import { buildBlend } from "@/lib/blend";
import type { BlendConfig } from "@/lib/config";
import { upcomingEvents } from "@/lib/ics";
import { decryptToken, getKeyFromEnv } from "@/lib/token";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

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

  let config: BlendConfig;
  try {
    config = decryptToken(token, key);
  } catch {
    return NextResponse.json(
      { error: "Invalid or tampered feed token." },
      { status: 400 }
    );
  }

  const { ics, failedSources } = await buildBlend(config);

  // JSON preview mode for the builder page (flow 3).
  const url = new URL(req.url);
  if (url.searchParams.get("preview") === "json") {
    return NextResponse.json(
      {
        events: upcomingEvents(ics, 10),
        failedSources,
        applied: {
          include: config.include ?? null,
          exclude: config.exclude ?? null,
          busyOnly: config.busyOnly === true,
          sourceCount: config.sources.length,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="ical-blend.ics"',
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      // Vercel's CDN consumes s-maxage/stale-while-revalidate from
      // Cache-Control and strips them from the client response. Giving the
      // CDN its own directive makes Vercel use this header for edge caching
      // and forward the original Cache-Control to clients untouched
      // (spec success check 7: clients must see s-maxage >= 300).
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
