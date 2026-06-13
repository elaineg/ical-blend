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

  it("deduplicates events with same DTSTART+SUMMARY when UIDs differ", () => {
    // Two cals where same event has different UIDs but identical DTSTART+SUMMARY
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
    // Different UIDs but same DTSTART+SUMMARY — should deduplicate.
    const out = mergeCalendars({
      calendars: [parseCalendar(calDup1), parseCalendar(calDup2)],
      options: {},
    });
    const outEvents = upcomingEvents(out, 10);
    expect(outEvents.length).toBe(1);
    expect(outEvents[0].summary).toBe("Team Meeting");
  });
});
