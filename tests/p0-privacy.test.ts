/**
 * P0 Privacy assertions for the dedup-under-masking fix.
 * Run with: npx vitest run tests/p0-privacy.test.ts
 */
import { describe, expect, it } from "vitest";
import { mergeCalendars, parseCalendar, unfold } from "../lib/ics";

// ---- 3a: Two DISTINCT events from a masked feed sharing the same DTSTART
//          do NOT collapse into one (no silent data loss).
describe("3a — same-DTSTART masked events: no silent collapse", () => {
  const TWO_SAME_DTSTART = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:work-alpha@a.com",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270615T090000Z",
    "DTEND:20270615T093000Z",
    "SUMMARY:Team Meeting",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:work-beta@a.com",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270615T090000Z",
    "DTEND:20270615T093000Z",
    "SUMMARY:Client Call",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("both events appear in output as 'Busy' (no silent collapse)", () => {
    const cal = parseCalendar(TWO_SAME_DTSTART);
    const out = mergeCalendars({
      calendars: [cal],
      options: {},
      perFeedOptions: [{ busyOnly: true }],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    // Both events must survive: dedup uses UID (different), not DTSTART alone.
    expect(summaries.length, "both events must appear, not collapse to 1").toBe(2);
    for (const s of summaries) {
      expect(s, "each survivor must be masked").toBe("SUMMARY:Busy");
    }
  });
});

// ---- 3b: Cross-feed leak — same UID in masked feed AND unmasked feed.
//          The merged output event MUST be masked, never the real title.
describe("3b — cross-feed UID leak: masked feed wins over unmasked", () => {
  const MASKED_FEED = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:shared-secret@example.com",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270620T100000Z",
    "DTEND:20270620T110000Z",
    "SUMMARY:SECRET Board Meeting",
    "DESCRIPTION:Confidential acquisition details",
    "LOCATION:Executive floor",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const UNMASKED_FEED = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:shared-secret@example.com",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270620T100000Z",
    "DTEND:20270620T110000Z",
    "SUMMARY:SECRET Board Meeting",
    "DESCRIPTION:Confidential acquisition details",
    "LOCATION:Executive floor",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("masked feed first: output event is 'Busy', secret title never appears", () => {
    const calMasked = parseCalendar(MASKED_FEED);
    const calUnmasked = parseCalendar(UNMASKED_FEED);
    // Masked feed is feed[0], unmasked is feed[1] — dedup picks feed[0]'s copy.
    const out = mergeCalendars({
      calendars: [calMasked, calUnmasked],
      options: {},
      perFeedOptions: [{ busyOnly: true }, {}],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaries.length, "one merged event (deduped by UID)").toBe(1);
    expect(summaries[0], "must be Busy, not the secret title").toBe("SUMMARY:Busy");
    expect(out, "secret title must not appear").not.toContain("SECRET Board Meeting");
    expect(out, "confidential description must not appear").not.toContain("Confidential");
  });

  it("unmasked feed first: output event is STILL 'Busy' (PRIVACY-WINS pre-scan)", () => {
    const calMasked = parseCalendar(MASKED_FEED);
    const calUnmasked = parseCalendar(UNMASKED_FEED);
    // Unmasked feed is feed[0], masked is feed[1] — dedup picks feed[0]'s copy first.
    // PRIVACY-WINS pre-scan must detect that the UID appears in a masked feed
    // and force-mask the survivor even though it came from the unmasked feed.
    const out = mergeCalendars({
      calendars: [calUnmasked, calMasked],
      options: {},
      perFeedOptions: [{}, { busyOnly: true }],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaries.length, "one merged event (deduped by UID)").toBe(1);
    expect(summaries[0], "must be Busy even though the surviving copy is from the unmasked feed").toBe("SUMMARY:Busy");
    expect(out, "secret title must not leak").not.toContain("SECRET Board Meeting");
    expect(out, "location must not leak").not.toContain("Executive floor");
  });
});

// ---- 3c: DTSTART+SUMMARY fallback identity — events lacking UID.
//          A duplicate across masked + unmasked feed still masks.
describe("3c — DTSTART+SUMMARY fallback privacy (events without UID)", () => {
  const NO_UID_MASKED = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270625T140000Z",
    "DTEND:20270625T150000Z",
    "SUMMARY:Private Lunch",
    "DESCRIPTION:With VP of Finance",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const NO_UID_UNMASKED = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270625T140000Z",
    "DTEND:20270625T150000Z",
    "SUMMARY:Private Lunch",
    "DESCRIPTION:With VP of Finance",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("unmasked-first: same event (no UID, same DTSTART+SUMMARY) in masked feed → output is Busy", () => {
    const calUnmasked = parseCalendar(NO_UID_UNMASKED);
    const calMasked = parseCalendar(NO_UID_MASKED);
    const out = mergeCalendars({
      calendars: [calUnmasked, calMasked],
      options: {},
      perFeedOptions: [{}, { busyOnly: true }],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    // Dedup drops the second occurrence; the survivor must be masked.
    expect(summaries.length, "one merged event").toBe(1);
    expect(summaries[0], "must be Busy not 'Private Lunch'").toBe("SUMMARY:Busy");
    expect(out).not.toContain("Private Lunch");
    expect(out).not.toContain("VP of Finance");
  });

  it("masked-first: both deduped events from masked feed also masked", () => {
    const calMasked = parseCalendar(NO_UID_MASKED);
    const calUnmasked = parseCalendar(NO_UID_UNMASKED);
    const out = mergeCalendars({
      calendars: [calMasked, calUnmasked],
      options: {},
      perFeedOptions: [{ busyOnly: true }, {}],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaries.length, "one merged event").toBe(1);
    expect(summaries[0]).toBe("SUMMARY:Busy");
  });
});

// ---- 3c-bis: Wen's real-feed regression — distinct UIDs, same DTSTART+SUMMARY,
//              one feed masked. BOTH events must survive (UID-first rule); the
//              unmasked feed's event keeps its real title (not corrupted to "Busy").
describe("3c-bis — distinct-UID same-title cross-feed (Wen regression)", () => {
  // Mirrors the US Holidays + Canada Holidays case: both have "New Year's Day" on Jan 1
  // with different UIDs. The Canada feed is masked. Expected: both events survive in
  // the output (65 input events → 65 output events for this pattern), and the US
  // feed's "New Year's Day" is NOT replaced by "Busy".
  function makeHoliday(uid: string, date: string, title: string): string {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      "DTSTAMP:20260101T000000Z",
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${date}`,
      `SUMMARY:${title}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  it("both feeds' 'New Year's Day' survive when one feed is masked and UIDs differ", () => {
    // US: UID us-ny@holidays, unmasked with [Work] prefix
    const usIcs = makeHoliday("us-ny@holidays", "20270101", "New Year's Day");
    // Canada: UID ca-ny@holidays, masked
    const caIcs = makeHoliday("ca-ny@holidays", "20270101", "New Year's Day");

    const out = mergeCalendars({
      calendars: [parseCalendar(usIcs), parseCalendar(caIcs)],
      options: {},
      perFeedOptions: [{ prefix: "[Work]" }, { busyOnly: true }],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));

    // Both events must appear — one for each distinct UID.
    expect(summaries.length, "both events must survive (no silent data loss)").toBe(2);

    // US feed event: NOT masked — must keep real title (with prefix, exactly one space).
    expect(
      summaries.some((s) => s === "SUMMARY:[Work] New Year's Day"),
      "US feed real title must survive with prefix"
    ).toBe(true);

    // Canada feed event: masked — must be "Busy".
    expect(
      summaries.some((s) => s === "SUMMARY:Busy"),
      "Canada masked feed event must be Busy"
    ).toBe(true);
  });

  it("count parity: N input events from two feeds with distinct UIDs → N output events", () => {
    // 3 holidays in US feed + 3 same-date same-title holidays in Canada feed (all distinct UIDs).
    const dates = [
      ["20270101", "New Year's Day"],
      ["20270415", "Good Friday"],
      ["20270417", "Easter Sunday"],
    ] as [string, string][];

    const usEvents = dates.map(([d, t]) => makeHoliday(`us-${d}@holidays`, d, t));
    const caEvents = dates.map(([d, t]) => makeHoliday(`ca-${d}@holidays`, d, t));

    // Parse as multi-event calendar
    const makeMultiCal = (events: string[]): string => {
      const all = events.map((s) => {
        const cal = parseCalendar(s);
        return cal.events[0];
      });
      return all.flat().join("\r\n"); // raw lines — parse individually
    };

    // Build proper ICS with multiple events
    const usCal = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      ...dates.map(([d, t]) => [
        "BEGIN:VEVENT",
        `UID:us-${d}@holidays`,
        "DTSTAMP:20260101T000000Z",
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${d}`,
        `SUMMARY:${t}`,
        "END:VEVENT",
      ]).flat(),
      "END:VCALENDAR",
    ].join("\r\n");

    const caCal = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      ...dates.map(([d, t]) => [
        "BEGIN:VEVENT",
        `UID:ca-${d}@holidays`,
        "DTSTAMP:20260101T000000Z",
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${d}`,
        `SUMMARY:${t}`,
        "END:VEVENT",
      ]).flat(),
      "END:VCALENDAR",
    ].join("\r\n");

    const out = mergeCalendars({
      calendars: [parseCalendar(usCal), parseCalendar(caCal)],
      options: {},
      perFeedOptions: [{ prefix: "[Work]" }, { busyOnly: true }],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));

    // 3 US + 3 CA = 6 events total, all with distinct UIDs, all must survive.
    expect(summaries.length, "all 6 events must survive (no silent data loss)").toBe(6);

    // US events keep real titles with prefix; CA events are masked.
    const workTitles = summaries.filter((s) => s.startsWith("SUMMARY:[Work]"));
    const busyTitles = summaries.filter((s) => s === "SUMMARY:Busy");
    expect(workTitles.length, "3 US events with real prefixed titles").toBe(3);
    expect(busyTitles.length, "3 CA events masked as Busy").toBe(3);
  });
});

// ---- 3d: Masked survivor keeps source feed's PREFIX ("[Work] Busy").
describe("3d — masked survivor keeps source feed prefix", () => {
  const FEED_A = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:work-standup@a.com",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270615T090000Z",
    "DTEND:20270615T093000Z",
    "SUMMARY:Daily standup",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const FEED_B = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:personal-gym@b.com",
    "DTSTAMP:20260601T000000Z",
    "DTSTART:20270616T070000Z",
    "DTEND:20270616T080000Z",
    "SUMMARY:Gym session",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("masked feed A with prefix '[Work] ' yields '[Work] Busy' not bare 'Busy'", () => {
    const calA = parseCalendar(FEED_A);
    const calB = parseCalendar(FEED_B);
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [{ busyOnly: true, prefix: "[Work] " }, { prefix: "[Personal] " }],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    // Feed A → masked with prefix.
    expect(summaries.some((s) => s === "SUMMARY:[Work] Busy"), "Feed A masked → '[Work] Busy'").toBe(true);
    // Feed B → not masked, gets its own prefix.
    expect(summaries.some((s) => s === "SUMMARY:[Personal] Gym session"), "Feed B unmasked → '[Personal] Gym session'").toBe(true);
    // No bare "Busy" without prefix.
    expect(summaries.some((s) => s === "SUMMARY:Busy"), "no bare Busy without prefix").toBe(false);
    // No real title from A leaks.
    expect(out, "Feed A real title must not appear").not.toContain("Daily standup");
  });

  it("two distinct masked feeds stay distinguishable via their prefixes", () => {
    const FEED_C = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:client-call@c.com",
      "DTSTAMP:20260601T000000Z",
      "DTSTART:20270617T150000Z",
      "DTEND:20270617T160000Z",
      "SUMMARY:Client negotiation",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const calA = parseCalendar(FEED_A);
    const calC = parseCalendar(FEED_C);
    const out = mergeCalendars({
      calendars: [calA, calC],
      options: {},
      perFeedOptions: [
        { busyOnly: true, prefix: "[Work] " },
        { busyOnly: true, prefix: "[Client] " },
      ],
    });
    const summaries = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaries).toContain("SUMMARY:[Work] Busy");
    expect(summaries).toContain("SUMMARY:[Client] Busy");
    // No real titles.
    expect(out).not.toContain("Daily standup");
    expect(out).not.toContain("Client negotiation");
  });
});
