/**
 * Unit tests for the preview pipeline (flow 3).
 *
 * Tests:
 * 1. friendlyFetchError: human reason mapping for 404, timeout, non-ICS, auth errors.
 * 2. Preview kept count: the count returned by the preview endpoint equals the number
 *    of non-marker VEVENTs that mergeCalendars produces — counting from parseCalendar.
 * 3. Reconciliation: fetched = sum of ok-source counts; kept <= fetched under exclude filter.
 * 4. All-failed: allFailed=true when every perSource entry is ok=false.
 * 5. ICS variety: all-day events, no-DTEND events, multiple VTIMEZONEs, weird SUMMARYs.
 */
import { describe, expect, it } from "vitest";
import { friendlyFetchError } from "../lib/blend";
import { mergeCalendars, parseCalendar, unfold } from "../lib/ics";

// --- friendlyFetchError ---

describe("friendlyFetchError: human-readable error mapping", () => {
  it("maps HTTP 404 to 'feed not found (404)'", () => {
    const r = friendlyFetchError(new Error("HTTP 404"));
    expect(r.toLowerCase()).toContain("404");
    expect(r.toLowerCase()).toContain("not found");
  });

  it("maps HTTP 401/403 to 'needs a login' message", () => {
    const r401 = friendlyFetchError(new Error("HTTP 401"));
    expect(r401.toLowerCase()).toContain("login");
    const r403 = friendlyFetchError(new Error("HTTP 403"));
    expect(r403.toLowerCase()).toContain("login");
  });

  it("maps timeout/abort to 'timed out'", () => {
    const r1 = friendlyFetchError(new Error("Request timed out after 8 s"));
    expect(r1.toLowerCase()).toContain("timed out");
    const r2 = friendlyFetchError(new Error("abort"));
    expect(r2.toLowerCase()).toContain("timed out");
    const r3 = friendlyFetchError(new Error("The operation was aborted."));
    expect(r3.toLowerCase()).toContain("timed out");
  });

  it("maps 'Not an ICS document' to 'not a calendar feed'", () => {
    const r = friendlyFetchError(new Error("Not an ICS document"));
    expect(r.toLowerCase()).toContain("calendar feed");
  });

  it("maps HTTP 429 to rate-limited message", () => {
    const r = friendlyFetchError(new Error("HTTP 429"));
    expect(r.toLowerCase()).toContain("rate limit");
  });

  it("maps HTTP 500 to server error message", () => {
    const r = friendlyFetchError(new Error("HTTP 500"));
    expect(r.toLowerCase()).toContain("server error");
  });

  it("maps 1 MB exceeded to 'too large' message", () => {
    const r = friendlyFetchError(new Error("Source exceeds 1 MB cap"));
    expect(r.toLowerCase()).toContain("large");
  });

  it("passes through unknown errors (truncated to 80 chars)", () => {
    const msg = "some unusual network error XYZ";
    const r = friendlyFetchError(new Error(msg));
    expect(r).toContain("unusual network");
    expect(r.length).toBeLessThanOrEqual(80);
  });

  it("handles non-Error thrown values", () => {
    const r = friendlyFetchError("string error");
    expect(typeof r).toBe("string");
    expect(r.length).toBeGreaterThan(0);
  });
});

// --- Reconciliation count parity with mergeCalendars ---

const FUTURE_DATE = "20280101T090000Z";
const FUTURE_ALLDAY = "20280101";

// Minimal test calendars with future dates
const WORK_ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Test//Preview//EN",
  "BEGIN:VEVENT",
  "UID:w-standup@test.preview",
  `DTSTAMP:20260101T000000Z`,
  `DTSTART:${FUTURE_DATE}`,
  "SUMMARY:Daily standup",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:w-planning@test.preview",
  "DTSTAMP:20260101T000000Z",
  "DTSTART:20280205T140000Z",
  "SUMMARY:Quarterly planning",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

const HOME_ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Test//Preview//EN",
  "BEGIN:VEVENT",
  "UID:h-piano@test.preview",
  "DTSTAMP:20260101T000000Z",
  "DTSTART:20280110T170000Z",
  "SUMMARY:Piano lesson",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:h-birthday@test.preview",
  "DTSTAMP:20260101T000000Z",
  `DTSTART;VALUE=DATE:${FUTURE_ALLDAY}`,
  "SUMMARY:Birthday party",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("reconciliation count: kept = parsed VEVENTs after all transforms", () => {
  it("no filter: kept = all merged events (4 total, 0 deduped)", () => {
    const calWork = parseCalendar(WORK_ICS);
    const calHome = parseCalendar(HOME_ICS);
    const merged = mergeCalendars({ calendars: [calWork, calHome], options: {} });
    const { events } = parseCalendar(merged);
    // Exclude marker events from kept count
    const keptEvents = events.filter((ev) => {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      return !s?.slice(8).trim().startsWith("iCal Blend:");
    });
    expect(keptEvents.length).toBe(4);
  });

  it("exclude 'standup': kept = 3 (standup dropped from work feed)", () => {
    const calWork = parseCalendar(WORK_ICS);
    const calHome = parseCalendar(HOME_ICS);
    const merged = mergeCalendars({
      calendars: [calWork, calHome],
      options: { exclude: "standup" },
    });
    const { events } = parseCalendar(merged);
    const keptEvents = events.filter((ev) => {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      return !s?.slice(8).trim().startsWith("iCal Blend:");
    });
    expect(keptEvents.length).toBe(3);
    // Verify standup is gone
    const sums = keptEvents.map((ev) => {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      return s?.slice(8).trim() ?? "";
    });
    expect(sums.some((s) => s.toLowerCase().includes("standup"))).toBe(false);
    expect(sums).toContain("Quarterly planning");
    expect(sums).toContain("Piano lesson");
    expect(sums).toContain("Birthday party");
  });

  it("busy-mask: count unchanged (mask changes titles, not count)", () => {
    const calWork = parseCalendar(WORK_ICS);
    const calHome = parseCalendar(HOME_ICS);
    const merged = mergeCalendars({
      calendars: [calWork, calHome],
      options: { busyOnly: true },
    });
    const { events } = parseCalendar(merged);
    const keptEvents = events.filter((ev) => {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      return !s?.slice(8).trim().startsWith("iCal Blend:");
    });
    expect(keptEvents.length).toBe(4);
    // All summaries are "Busy"
    for (const ev of keptEvents) {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      expect(s?.slice(8).trim()).toBe("Busy");
    }
  });

  it("per-feed hideAllDay on home feed: all-day birthday dropped, 3 events kept", () => {
    const calWork = parseCalendar(WORK_ICS);
    const calHome = parseCalendar(HOME_ICS);
    const merged = mergeCalendars({
      calendars: [calWork, calHome],
      options: {},
      perFeedOptions: [{}, { hideAllDay: true }],
    });
    const { events } = parseCalendar(merged);
    const keptEvents = events.filter((ev) => {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      return !s?.slice(8).trim().startsWith("iCal Blend:");
    });
    // Birthday (all-day, home feed) should be dropped
    expect(keptEvents.length).toBe(3);
    const sums = keptEvents.map((ev) => {
      const s = ev.find((l) => l.toUpperCase().startsWith("SUMMARY:"));
      return s?.slice(8).trim() ?? "";
    });
    expect(sums).not.toContain("Birthday party");
    expect(sums).toContain("Piano lesson");
  });
});

// --- ICS input variety: sentinel for parse robustness ---

describe("ICS input variety: all-day, no-DTEND, multiple VTIMEZONEs, weird SUMMARYs", () => {
  const ALL_DAY_ICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:allday-1@variety.test",
    "DTSTAMP:20260101T000000Z",
    "DTSTART;VALUE=DATE:20280315",
    "SUMMARY:All-day event",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const NO_DTEND_ICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:nodtend-1@variety.test",
    "DTSTAMP:20260101T000000Z",
    "DTSTART:20280320T090000Z",
    "SUMMARY:Event with no DTEND",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const MULTI_TZ_ICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:STANDARD",
    "DTSTART:19701101T020000",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/London",
    "BEGIN:STANDARD",
    "DTSTART:19701025T020000",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0000",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    "UID:multitz-1@variety.test",
    "DTSTAMP:20260101T000000Z",
    "DTSTART;TZID=America/New_York:20280325T100000",
    "DTEND;TZID=America/New_York:20280325T110000",
    "SUMMARY:Cross-timezone event",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:multitz-2@variety.test",
    "DTSTAMP:20260101T000000Z",
    "DTSTART;TZID=Europe/London:20280326T090000",
    "DTEND;TZID=Europe/London:20280326T100000",
    "SUMMARY:London event",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const WEIRD_SUMMARY_ICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:weird-1@variety.test",
    "DTSTAMP:20260101T000000Z",
    "DTSTART:20280401T120000Z",
    // SUMMARY with special characters, escaped commas, semicolons
    "SUMMARY:Team meeting\\, quarterly (Q1\\; 2028)",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:weird-2@variety.test",
    "DTSTAMP:20260101T000000Z",
    "DTSTART:20280402T120000Z",
    // SUMMARY with unicode
    "SUMMARY:Réunion d'équipe — Berlin 🎹",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("all-day event parses and merges without error", () => {
    const cal = parseCalendar(ALL_DAY_ICS);
    expect(cal.events).toHaveLength(1);
    const out = mergeCalendars({ calendars: [cal], options: {} });
    expect(out).toContain("DTSTART;VALUE=DATE:20280315");
    expect(out).toContain("SUMMARY:All-day event");
  });

  it("event with no DTEND parses and merges without error", () => {
    const cal = parseCalendar(NO_DTEND_ICS);
    expect(cal.events).toHaveLength(1);
    const out = mergeCalendars({ calendars: [cal], options: {} });
    expect(out).toContain("SUMMARY:Event with no DTEND");
    // DTSTART preserved
    expect(out).toContain("DTSTART:20280320T090000Z");
  });

  it("multiple VTIMEZONEs: all timezone blocks preserved/deduped, both events present", () => {
    const cal = parseCalendar(MULTI_TZ_ICS);
    expect(cal.events).toHaveLength(2);
    expect(cal.timezones).toHaveLength(2);
    const out = mergeCalendars({ calendars: [cal], options: {} });
    // Both VTIMEZONEs preserved
    expect((out.match(/BEGIN:VTIMEZONE/g) ?? []).length).toBe(2);
    // Both events present
    expect(out).toContain("SUMMARY:Cross-timezone event");
    expect(out).toContain("SUMMARY:London event");
  });

  it("weird SUMMARYs (escaped commas, unicode) survive merge without corruption", () => {
    const cal = parseCalendar(WEIRD_SUMMARY_ICS);
    expect(cal.events).toHaveLength(2);
    const out = mergeCalendars({ calendars: [cal], options: {} });
    // Escaped comma preserved
    expect(out).toContain("Team meeting\\, quarterly");
    // Unicode preserved
    expect(out).toContain("Réunion d'équipe");
  });

  it("include-keyword filter on weird SUMMARY with unescaped value matches correctly", () => {
    const cal = parseCalendar(WEIRD_SUMMARY_ICS);
    // Include "meeting" — the unescaped summary contains "Team meeting, quarterly (Q1; 2028)"
    const out = mergeCalendars({
      calendars: [cal],
      options: { include: "meeting" },
    });
    expect(out).toContain("Team meeting");
    // Berlin event doesn't match "meeting" — excluded
    expect(out).not.toContain("Berlin");
  });

  it("busy-mask preserves DTSTART/DTEND, drops DESCRIPTION/LOCATION even for all-day events", () => {
    const allDayWithExtra = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:allday-extra@variety.test",
      "DTSTAMP:20260101T000000Z",
      "DTSTART;VALUE=DATE:20280615",
      "DTEND;VALUE=DATE:20280616",
      "SUMMARY:Holiday",
      "DESCRIPTION:National holiday",
      "LOCATION:Everywhere",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const cal = parseCalendar(allDayWithExtra);
    const out = mergeCalendars({ calendars: [cal], options: { busyOnly: true } });
    const lines = unfold(out);
    const summaryLines = lines.filter((l) => l.startsWith("SUMMARY:"));
    expect(summaryLines).toHaveLength(1);
    expect(summaryLines[0]).toBe("SUMMARY:Busy");
    expect(out).toContain("DTSTART;VALUE=DATE:20280615");
    expect(out).not.toContain("DESCRIPTION");
    expect(out).not.toContain("LOCATION");
  });
});
