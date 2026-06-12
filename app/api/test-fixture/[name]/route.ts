/**
 * Local ICS fixtures for tests/e2e so they never depend on the network.
 * Disabled in production unless ALLOW_TEST_FIXTURES=1 is set.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function dt(daysFromNow: number, hour: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function calendar(name: string, events: string[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//iCal Blend test fixture//${name}//EN`,
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function event(uid: string, day: number, hour: number, summary: string, extra: string[] = []): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@fixture.ical-blend`,
    `DTSTAMP:${dt(0, 0)}`,
    `DTSTART:${dt(day, hour)}`,
    `DTEND:${dt(day, hour + 1)}`,
    `SUMMARY:${summary}`,
    ...extra,
    "END:VEVENT",
  ];
}

const FIXTURES: Record<string, () => string> = {
  work: () =>
    calendar("work", [
      ...event("work-1", 1, 9, "Daily standup", [
        "DESCRIPTION:Sync with the team",
        "LOCATION:Zoom",
      ]),
      ...event("work-2", 2, 14, "Quarterly planning", [
        "ORGANIZER;CN=Boss:mailto:boss@example.com",
        "ATTENDEE;CN=Me:mailto:me@example.com",
      ]),
      ...event("work-3", 3, 9, "Weekly standup retro"),
    ]),
  home: () =>
    calendar("home", [
      ...event("home-1", 1, 17, "Piano lesson", ["LOCATION:Music school"]),
      ...event("home-2", 4, 11, "Dentist appointment", [
        "DESCRIPTION:Bring insurance card",
      ]),
      ...event("home-3", 6, 17, "Piano recital"),
    ]),
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ name: string }> }
) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_TEST_FIXTURES !== "1"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { name } = await context.params;
  const fixture = FIXTURES[name];
  if (!fixture) {
    return NextResponse.json({ error: "Unknown fixture" }, { status: 404 });
  }
  return new NextResponse(fixture(), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
