import { describe, expect, it } from "vitest";
import {
  busyHashUid,
  busyMask,
  escapeText,
  foldLine,
  getProp,
  mergeCalendars,
  parseCalendar,
  parseIcsDate,
  unescapeText,
  unfold,
  upcomingEvents,
} from "../lib/ics";

const CAL_A = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//A//A//EN",
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "BEGIN:STANDARD",
  "DTSTART:19701025T030000",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "END:STANDARD",
  "END:VTIMEZONE",
  "BEGIN:VEVENT",
  "UID:a-1@example.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART;TZID=Europe/Berlin:20270615T090000",
  "DTEND;TZID=Europe/Berlin:20270615T093000",
  "SUMMARY:Daily Standup",
  "DESCRIPTION:Team sync with a long agenda that goes on and on and on and o",
  " n and wraps across folded lines per RFC 5545",
  "LOCATION:Zoom",
  "BEGIN:VALARM",
  "ACTION:DISPLAY",
  "DESCRIPTION:Reminder",
  "TRIGGER:-PT10M",
  "END:VALARM",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:shared@example.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270620T100000Z",
  "SUMMARY:Planning",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

// CAL_B has a unique event (Piano lesson) plus a duplicate of CAL_A's
// "Planning" event (shared@example.com) to test cross-source deduplication.
const CAL_B = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//B//B//EN",
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "BEGIN:STANDARD",
  "DTSTART:19701025T030000",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "END:STANDARD",
  "END:VTIMEZONE",
  "BEGIN:VEVENT",
  "UID:b-piano@example.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270618T170000Z",
  "SUMMARY:Piano lesson",
  "ATTENDEE;CN=Kid:mailto:kid@example.com",
  "ORGANIZER;CN=Teacher:mailto:t@example.com",
  "URL:https://music-school.example.com",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:shared@example.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270620T100000Z",
  "SUMMARY:Planning",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("unfold/fold", () => {
  it("joins folded continuation lines", () => {
    const lines = unfold("SUMMARY:Hello\r\n  world\r\nDTSTART:20270101");
    expect(lines[0]).toBe("SUMMARY:Hello world");
    expect(lines).toHaveLength(2);
  });

  it("folds long lines at <=75 octets and round-trips", () => {
    const long = "DESCRIPTION:" + "x".repeat(300);
    const folded = foldLine(long);
    for (const part of folded.split("\r\n")) {
      expect(Buffer.byteLength(part, "utf8")).toBeLessThanOrEqual(75);
    }
    expect(unfold(folded)[0]).toBe(long);
  });

  it("folds without splitting UTF-8 multibyte chars and round-trips", () => {
    const long = "SUMMARY:" + "é漢字🎹".repeat(40);
    const folded = foldLine(long);
    for (const part of folded.split("\r\n")) {
      expect(Buffer.byteLength(part, "utf8")).toBeLessThanOrEqual(75);
    }
    expect(unfold(folded)[0]).toBe(long);
  });
});

describe("parseCalendar", () => {
  it("extracts VEVENTs and VTIMEZONEs", () => {
    const cal = parseCalendar(CAL_A);
    expect(cal.events).toHaveLength(2);
    expect(cal.timezones).toHaveLength(1);
    expect(getProp(cal.events[0], "SUMMARY")).toBe("Daily Standup");
    // Folded DESCRIPTION was unfolded into one logical line.
    expect(getProp(cal.events[0], "DESCRIPTION")).toContain("wraps across folded lines");
  });
});

describe("mergeCalendars", () => {
  const calA = parseCalendar(CAL_A);
  const calB = parseCalendar(CAL_B);

  it("merges events from both sources into one valid VCALENDAR", () => {
    const out = mergeCalendars({ calendars: [calA, calB], options: {} });
    expect(out.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(out.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(out).toContain("SUMMARY:Daily Standup");
    expect(out).toContain("SUMMARY:Piano lesson");
    // Single calendar wrapper only.
    expect(out.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
    // Output uses CRLF exclusively.
    expect(out.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("dedupes VTIMEZONEs by TZID and deduplicates events by UID across sources", () => {
    const out = mergeCalendars({ calendars: [calA, calB], options: {} });
    expect(out.match(/BEGIN:VTIMEZONE/g)).toHaveLength(1);
    const uids = unfold(out)
      .filter((l) => l.startsWith("UID"))
      .map((l) => l.slice(l.indexOf(":") + 1));
    // calA: a-1@example.com, shared@example.com (Planning)
    // calB: b-piano@example.com (Piano lesson), shared@example.com (Planning — duplicate, dropped)
    // Result: 3 unique UIDs, shared@example.com appears only once.
    expect(new Set(uids).size).toBe(uids.length);
    expect(uids).toContain("a-1@example.com");
    expect(uids).toContain("shared@example.com");
    expect(uids).toContain("b-piano@example.com");
    expect(uids).toHaveLength(3);
  });

  it("exclude filter removes matching events case-insensitively", () => {
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: { exclude: "STANDUP" },
    });
    expect(out).not.toContain("Daily Standup");
    expect(out).toContain("SUMMARY:Planning");
    expect(out).toContain("SUMMARY:Piano lesson");
  });

  it("include filter keeps only matching events", () => {
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: { include: "piano" },
    });
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).not.toContain("SUMMARY:Daily Standup");
    expect(out).not.toContain("SUMMARY:Planning");
  });

  it("comma-OR exclude: 'standup, lunch' drops events matching either term", () => {
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: { exclude: "standup, lunch" },
    });
    // "Daily Standup" matches "standup" → dropped
    expect(out).not.toContain("Daily Standup");
    // "Piano lesson" and "Planning" match neither term → kept
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).toContain("SUMMARY:Planning");
  });

  it("comma-OR include: 'piano, planning' keeps events matching either term", () => {
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: { include: "piano, planning" },
    });
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).toContain("SUMMARY:Planning");
    expect(out).not.toContain("SUMMARY:Daily Standup");
  });

  it("single comma-less keyword is byte-identical behaviour to before (no regression)", () => {
    // "standup" with no comma → same as the original single-substring check
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: { exclude: "STANDUP" },
    });
    expect(out).not.toContain("Daily Standup");
    expect(out).toContain("SUMMARY:Planning");
    expect(out).toContain("SUMMARY:Piano lesson");
  });

  it("empty filter = no filter (match-all for include, drop-none for exclude)", () => {
    const outExcludeEmpty = mergeCalendars({
      calendars: [calA, calB],
      options: { exclude: "" },
    });
    // All 3 unique events should survive
    expect(outExcludeEmpty).toContain("Daily Standup");
    expect(outExcludeEmpty).toContain("Piano lesson");
    expect(outExcludeEmpty).toContain("Planning");

    const outIncludeEmpty = mergeCalendars({
      calendars: [calA, calB],
      options: { include: "" },
    });
    expect(outIncludeEmpty).toContain("Daily Standup");
    expect(outIncludeEmpty).toContain("Piano lesson");
    expect(outIncludeEmpty).toContain("Planning");
  });

  it("whitespace-only or comma-only filter = no filter", () => {
    const outWhitespace = mergeCalendars({
      calendars: [calA, calB],
      options: { exclude: "   " },
    });
    expect(outWhitespace).toContain("Daily Standup");

    const outCommas = mergeCalendars({
      calendars: [calA, calB],
      options: { exclude: ",,,," },
    });
    expect(outCommas).toContain("Daily Standup");
  });

  it("per-feed comma-OR include works via summaryMatches", () => {
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [
        { include: "standup, planning" }, // feed 0: keep only standup or planning
        {},                               // feed 1: no filter
      ],
    });
    // From feed 0: Daily Standup and Planning pass; Planning is deduped (shared UID)
    expect(out).toContain("Daily Standup");
    // Piano lesson is from feed 1 (unfiltered)
    expect(out).toContain("Piano lesson");
  });

  it("per-feed comma-OR exclude works via summaryMatches", () => {
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [
        { exclude: "standup, planning" }, // feed 0: drop standup and planning
        {},                               // feed 1: no filter
      ],
    });
    // From feed 0: Daily Standup and Planning dropped; "shared@" Planning in feed 1 survives
    expect(out).not.toContain("Daily Standup");
    expect(out).toContain("Planning");    // survived via feed 1
    expect(out).toContain("Piano lesson");
  });

  it("appends a marker event when sources failed", () => {
    const out = mergeCalendars({
      calendars: [calA],
      options: {},
      failedSources: [2],
    });
    expect(out).toContain("SUMMARY:iCal Blend: 1 source failed");
    expect(out).toContain("DTSTART;VALUE=DATE:");
  });
});

describe("busyMask", () => {
  const calA = parseCalendar(CAL_A);

  it("replaces SUMMARY with Busy and strips private fields, keeping times", () => {
    const out = mergeCalendars({
      calendars: [calA, parseCalendar(CAL_B)],
      options: { busyOnly: true },
    });
    const lines = unfold(out);
    const summaries = lines.filter((l) => l.startsWith("SUMMARY"));
    expect(summaries.length).toBeGreaterThan(0);
    for (const s of summaries) expect(s).toBe("SUMMARY:Busy");
    for (const banned of ["DESCRIPTION", "LOCATION", "ATTENDEE", "ORGANIZER", "URL:"]) {
      expect(lines.some((l) => l.startsWith(banned))).toBe(false);
    }
    expect(lines.some((l) => l.startsWith("DTSTART"))).toBe(true);
    expect(lines.some((l) => l.startsWith("DTEND"))).toBe(true);
    // VALARM subcomponents are dropped under the mask.
    expect(out).not.toContain("BEGIN:VALARM");
  });

  it("operates on a single event's lines", () => {
    const masked = busyMask(calA.events[0]);
    expect(masked).toContain("SUMMARY:Busy");
    expect(masked.filter((l) => l.startsWith("SUMMARY"))).toHaveLength(1);
  });

  it("replaces UIDs with opaque hashes under busy-only mask", () => {
    const out = mergeCalendars({
      calendars: [calA, parseCalendar(CAL_B)],
      options: { busyOnly: true },
    });
    const lines = unfold(out);
    const uidLines = lines.filter((l) => l.startsWith("UID:"));
    // No original UIDs should appear in the output.
    for (const u of uidLines) {
      expect(u).not.toContain("a-1@example.com");
      expect(u).not.toContain("shared@example.com");
      // Should be our opaque hash pattern.
      expect(u).toMatch(/^UID:busy-[0-9a-f]{8}@ical-blend$/);
    }
    // UIDs are still unique (stable per event).
    const uids = uidLines.map((l) => l.slice(4));
    expect(new Set(uids).size).toBe(uids.length);
  });
});

describe("busyHashUid", () => {
  it("returns a stable opaque hash for the same input", () => {
    const uid = "ChristmasDay@gov.uk";
    expect(busyHashUid(uid)).toBe(busyHashUid(uid));
    expect(busyHashUid(uid)).toMatch(/^busy-[0-9a-f]{8}@ical-blend$/);
  });

  it("returns different hashes for different inputs", () => {
    expect(busyHashUid("uid-A@example.com")).not.toBe(busyHashUid("uid-B@example.com"));
  });

  it("does not contain the original UID value", () => {
    const original = "ChristmasDay@gov.uk";
    expect(busyHashUid(original)).not.toContain("Christmas");
    expect(busyHashUid(original)).not.toContain("gov.uk");
  });
});

describe("dates and text escaping", () => {
  it("parses date and date-time forms", () => {
    expect(parseIcsDate("20270615")?.toISOString()).toBe("2027-06-15T00:00:00.000Z");
    expect(parseIcsDate("20270615T093000Z")?.toISOString()).toBe(
      "2027-06-15T09:30:00.000Z"
    );
    expect(parseIcsDate("garbage")).toBeNull();
  });

  it("escape/unescape round-trips", () => {
    const s = "a, b; c\nnewline \\ backslash";
    expect(unescapeText(escapeText(s))).toBe(s);
  });
});

describe("upcomingEvents", () => {
  it("returns future events sorted by start, capped at limit", () => {
    const out = mergeCalendars({
      calendars: [parseCalendar(CAL_A), parseCalendar(CAL_B)],
      options: {},
    });
    const events = upcomingEvents(out, 10);
    // calA: Daily Standup (Jun 15), Planning (Jun 20)
    // calB: Piano lesson (Jun 18), Planning again (deduped out)
    // Result: 3 events, sorted by date.
    expect(events.length).toBe(3);
    expect(events[0].summary).toBe("Daily Standup");
    expect(events[1].summary).toBe("Piano lesson");
    expect(events[2].summary).toBe("Planning");
    const times = events.map((e) => (e.start ? Date.parse(e.start) : 0));
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("does NOT deduplicate events with different UIDs even if DTSTART+SUMMARY match (UID-first identity)", () => {
    // Two events from different providers: different UIDs, same DTSTART+SUMMARY.
    // These are genuinely distinct events (e.g. US Holidays vs Canada Holidays both
    // have "New Year's Day" on Jan 1 but with different UIDs). Both must survive.
    const calDup1 = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:ev-source-1@a.com",
      "DTSTART:20270701T100000Z",
      "SUMMARY:Team Meeting",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const calDup2 = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:ev-source-2@b.com",
      "DTSTART:20270701T100000Z",
      "SUMMARY:Team Meeting",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    // Different UIDs → both events must survive (UID-first rule).
    const out = mergeCalendars({
      calendars: [parseCalendar(calDup1), parseCalendar(calDup2)],
      options: {},
    });
    const outEvents = upcomingEvents(out, 10);
    expect(outEvents.length).toBe(2);
    expect(outEvents[0].summary).toBe("Team Meeting");
    expect(outEvents[1].summary).toBe("Team Meeting");
  });
});

describe("dedup-under-masking correctness (P0 privacy)", () => {
  // Two events on the same date with different summaries — same DTSTART but
  // distinct summaries → different content keys → must NOT collapse.
  it("distinct masked events with same DTSTART but different SUMMARY do NOT collapse", () => {
    const cal = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:ev-A@test.com",
      "DTSTART:20270901T100000Z",
      "SUMMARY:Meeting A",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:ev-B@test.com",
      "DTSTART:20270901T100000Z",
      "SUMMARY:Meeting B",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const out = mergeCalendars({
      calendars: [parseCalendar(cal)],
      options: { busyOnly: true },
    });
    // Both events must survive — two "Busy" rows.
    const summaryLines = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaryLines).toHaveLength(2);
    for (const s of summaryLines) expect(s).toBe("SUMMARY:Busy");
  });

  // Cross-feed duplicate: same UID in feed-A (unmasked) and feed-B (masked).
  // The survivor must be masked (privacy-wins rule), never leaking feed-A's title.
  it("cross-feed duplicate where one feed is masked → output is masked (no title leak)", () => {
    const feedUnmasked = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:shared-holiday@example.com",
      "DTSTART:20270101T000000Z",
      "SUMMARY:New Year's Day",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const feedMasked = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:shared-holiday@example.com",
      "DTSTART:20270101T000000Z",
      "SUMMARY:New Year's Day",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    // Feed 0 is unmasked, feed 1 is masked (per-feed busyOnly).
    const out = mergeCalendars({
      calendars: [parseCalendar(feedUnmasked), parseCalendar(feedMasked)],
      options: {},
      perFeedOptions: [{}, { busyOnly: true }],
    });
    // Event must exist exactly once.
    const summaryLines = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaryLines).toHaveLength(1);
    // Must be masked — never reveal "New Year's Day".
    expect(summaryLines[0]).toBe("SUMMARY:Busy");
    expect(out).not.toContain("New Year");
  });

  // Cross-feed: different UIDs, same DTSTART+SUMMARY, one feed masked.
  // UID-first rule: both events survive. The masked-feed event is "Busy";
  // the unmasked-feed event keeps its real title (they are DISTINCT events).
  it("cross-feed different-UID same-DTSTART+SUMMARY: both survive, masked feed is Busy, unmasked keeps real title", () => {
    const feedUnmasked = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:holiday-us@provider-a.com",
      "DTSTART:20271225T000000Z",
      "SUMMARY:Christmas Day",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const feedMasked = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:holiday-gb@provider-b.com",
      "DTSTART:20271225T000000Z",
      "SUMMARY:Christmas Day",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const out = mergeCalendars({
      calendars: [parseCalendar(feedUnmasked), parseCalendar(feedMasked)],
      options: {},
      perFeedOptions: [{}, { busyOnly: true }],
    });
    const summaryLines = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    // Both events must survive (different UIDs = different events).
    expect(summaryLines).toHaveLength(2);
    // One is Busy (masked feed), one keeps real title (unmasked feed).
    expect(summaryLines).toContain("SUMMARY:Busy");
    expect(summaryLines).toContain("SUMMARY:Christmas Day");
  });

  // Masked survivor with a per-feed prefix: prefix must appear on the output.
  it("masked survivor from masked feed carries that feed's prefix", () => {
    const feedMasked = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:work-event@test.com",
      "DTSTART:20270615T090000Z",
      "SUMMARY:Secret meeting",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const out = mergeCalendars({
      calendars: [parseCalendar(feedMasked)],
      options: {},
      perFeedOptions: [{ busyOnly: true, prefix: "[Work] " }],
    });
    expect(out).toContain("SUMMARY:[Work] Busy");
    expect(out).not.toContain("Secret");
  });

  // Cross-feed: different UIDs (UID-first rule) — both events survive independently.
  // The masked feed's event is "[Masked] Busy"; the unmasked feed's event keeps its real title.
  it("UID-first cross-feed: different UIDs → both events survive, each gets its own feed's treatment", () => {
    const feedWithPrefix = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:holiday-a@prefix.com",
      "DTSTART:20270704T000000Z",
      "SUMMARY:Independence Day",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const feedMasked = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:holiday-b@masked.com",
      "DTSTART:20270704T000000Z",
      "SUMMARY:Independence Day",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const out = mergeCalendars({
      calendars: [parseCalendar(feedWithPrefix), parseCalendar(feedMasked)],
      options: {},
      perFeedOptions: [{ prefix: "[USA] " }, { busyOnly: true }],
    });
    // Both events survive (different UIDs = distinct events).
    const summaryLines = unfold(out).filter((l) => l.startsWith("SUMMARY:"));
    expect(summaryLines).toHaveLength(2);
    // Unmasked feed keeps real title with prefix.
    expect(summaryLines).toContain("SUMMARY:[USA] Independence Day");
    // Masked feed is Busy.
    expect(summaryLines).toContain("SUMMARY:Busy");
  });
});

describe("count honesty: reported count === VEVENT count in serialized ICS", () => {
  // Regression for Marcus's bug: the count shown in the UI must equal the number
  // of BEGIN:VEVENT lines in the ICS that mergeCalendars produces — with ALL
  // transforms active: dedup, include/exclude filter, per-feed mask, per-feed
  // prefix, and per-feed hideAllDay.

  // Three feeds:
  //   Feed 0 (Work): 2 events, prefix [Work], not masked, no hideAllDay
  //   Feed 1 (Home): 3 events (1 all-day), no prefix, masked to Busy, hideAllDay ON
  //   Feed 2 (Extra): 1 event with UID shared with Feed 0 (should dedup out),
  //                   1 unique event matching exclude keyword (dropped by filter)
  const FEED_WORK = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:work-a@test.com",
    "DTSTART:20270801T090000Z",
    "SUMMARY:Sprint planning",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:work-b@test.com",
    "DTSTART:20270802T090000Z",
    "SUMMARY:Code review",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const FEED_HOME = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:home-a@test.com",
    "DTSTART:20270803T180000Z",
    "SUMMARY:Dinner reservation",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:home-b@test.com",
    "DTSTART;VALUE=DATE:20270804",
    "SUMMARY:Alice birthday",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:home-c@test.com",
    "DTSTART:20270805T100000Z",
    "SUMMARY:Doctor appointment",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // Feed 2: duplicate of work-a (will dedup), plus an excluded event.
  const FEED_EXTRA = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:work-a@test.com",
    "DTSTART:20270801T090000Z",
    "SUMMARY:Sprint planning",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:extra-standup@test.com",
    "DTSTART:20270806T090000Z",
    "SUMMARY:Daily standup",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("mergeCalendars count === parseCalendar(output).events.length with all transforms active", () => {
    const out = mergeCalendars({
      calendars: [
        parseCalendar(FEED_WORK),
        parseCalendar(FEED_HOME),
        parseCalendar(FEED_EXTRA),
      ],
      options: {
        exclude: "standup", // removes extra-standup@test.com
      },
      perFeedOptions: [
        { prefix: "[Work] " },                   // Feed 0: prefix only
        { busyOnly: true, hideAllDay: true },     // Feed 1: mask + hide all-day (drops home-b)
        {},                                      // Feed 2: no options
      ],
    });

    // Count VEVENTs via parseCalendar on the serialized ICS (same path as /api/token).
    const { events: parsedEvents } = parseCalendar(out);
    const countFromParse = parsedEvents.length;

    // Count raw BEGIN:VEVENT occurrences in the serialized output.
    const countFromIcs = (out.match(/^BEGIN:VEVENT\r?$/gm) ?? []).length;

    // Both counts must agree with each other.
    expect(countFromParse).toBe(countFromIcs);

    // Sanity-check the expected survivor events:
    // Feed 0: work-a (Sprint planning), work-b (Code review) → 2 events
    // Feed 1: home-a (Dinner, timed → masked to Busy), home-b (all-day → dropped),
    //         home-c (Doctor appointment, timed → masked to Busy) → 2 events
    // Feed 2: work-a (deduped with Feed 0 → dropped),
    //         extra-standup (matches "standup" exclude → dropped) → 0 events
    // Total expected: 4
    expect(countFromParse).toBe(4);

    // Verify the right events survived (with correct transforms):
    // Feed 0 with [Work] prefix
    expect(out).toContain("SUMMARY:[Work] Sprint planning");
    expect(out).toContain("SUMMARY:[Work] Code review");
    // Feed 1 masked (Busy), all-day birthday dropped
    expect(out).not.toContain("Alice birthday");
    // Feed 2's standup excluded
    expect(out).not.toContain("standup");
    expect(out).not.toContain("Standup");
    // Feed 2's duplicate deduped
    const sprintCount = (out.match(/Sprint planning/g) ?? []).length;
    expect(sprintCount).toBe(1);
  });
});
