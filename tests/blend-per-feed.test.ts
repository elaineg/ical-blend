/**
 * Unit tests for per-feed blend rules:
 * - prefix scoping (only affects the configured feed)
 * - per-feed busy mask scoping (only affects the configured feed)
 * - per-feed hide-all-day scoping (only drops all-day from configured feed)
 * - legacy string[] config merges unchanged (back-compat)
 * - prefix + masked event = "[Prefix] Busy"
 * - global busy-only OR per-feed busyOnly → that feed is masked
 */
import { describe, expect, it } from "vitest";
import { mergeCalendars, parseCalendar, unfold } from "../lib/ics";
import { validateConfig, normalizeSource } from "../lib/config";

// Feed A: timed events only
const FEED_A_ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "UID:work-standup@a.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270615T090000Z",
  "DTEND:20270615T093000Z",
  "SUMMARY:Daily standup",
  "DESCRIPTION:Team meeting",
  "LOCATION:Zoom",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:work-planning@a.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270620T140000Z",
  "DTEND:20270620T150000Z",
  "SUMMARY:Quarterly planning",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

// Feed B: timed + all-day events
const FEED_B_ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "UID:home-piano@b.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270618T170000Z",
  "DTEND:20270618T180000Z",
  "SUMMARY:Piano lesson",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:home-birthday@b.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART;VALUE=DATE:20270619",
  "DTEND;VALUE=DATE:20270620",
  "SUMMARY:Alice's birthday",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:home-holiday@b.com",
  "DTSTAMP:20260601T000000Z",
  "DTSTART:20270625T100000Z",
  "DTEND:20270625T110000Z",
  "SUMMARY:Holiday gathering",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("per-feed prefix", () => {
  it("prepends prefix only to the configured feed's events", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const calB = parseCalendar(FEED_B_ICS);
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [{ prefix: "[Work] " }, {}],
    });
    // Feed A events should have prefix.
    expect(out).toContain("SUMMARY:[Work] Daily standup");
    expect(out).toContain("SUMMARY:[Work] Quarterly planning");
    // Feed B events should NOT have prefix.
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).not.toContain("SUMMARY:[Work] Piano lesson");
  });

  it("does not add prefix when feedOptions is empty", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const out = mergeCalendars({
      calendars: [calA],
      options: {},
      perFeedOptions: [],
    });
    expect(out).toContain("SUMMARY:Daily standup");
    expect(out).not.toContain("SUMMARY:[Work]");
  });
});

describe("per-feed busy mask", () => {
  it("masks only the configured feed, leaving other feeds detailed", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const calB = parseCalendar(FEED_B_ICS);
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [{ busyOnly: true }, {}],
    });
    const lines = unfold(out);
    const summaryLines = lines.filter((l) => l.startsWith("SUMMARY:"));
    // Feed A events should be masked.
    const busySummaries = summaryLines.filter((l) => l === "SUMMARY:Busy");
    const realSummaries = summaryLines.filter((l) => l !== "SUMMARY:Busy");
    expect(busySummaries.length).toBeGreaterThanOrEqual(2); // A has 2 events
    // Feed B events keep their titles.
    expect(realSummaries.some((l) => l.includes("Piano lesson"))).toBe(true);
    expect(realSummaries.some((l) => l.includes("Holiday gathering"))).toBe(true);
    // Feed A: no DESCRIPTION/LOCATION (stripped by mask).
    const descLines = lines.filter((l) => l.startsWith("DESCRIPTION:") || l.startsWith("LOCATION:"));
    expect(descLines.length).toBe(0);
  });

  it("global busyOnly masks all feeds regardless of per-feed setting", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const calB = parseCalendar(FEED_B_ICS);
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: { busyOnly: true },
      perFeedOptions: [{}, {}],
    });
    const lines = unfold(out);
    const summaryLines = lines.filter((l) => l.startsWith("SUMMARY:"));
    for (const s of summaryLines) expect(s).toBe("SUMMARY:Busy");
  });

  it("masked event with prefix reads '[Prefix] Busy'", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const out = mergeCalendars({
      calendars: [calA],
      options: {},
      perFeedOptions: [{ busyOnly: true, prefix: "[Work] " }],
    });
    expect(out).toContain("SUMMARY:[Work] Busy");
    expect(out).not.toContain("SUMMARY:Busy\r\n");
  });
});

describe("per-feed hide-all-day", () => {
  it("drops all-day events from the configured feed only", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const calB = parseCalendar(FEED_B_ICS);
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [{}, { hideAllDay: true }],
    });
    // Feed B all-day event (birthday) should be dropped.
    expect(out).not.toContain("Alice");
    // Feed B timed events should still be present.
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).toContain("SUMMARY:Holiday gathering");
    // Feed A events are unaffected.
    expect(out).toContain("SUMMARY:Daily standup");
  });

  it("does not drop timed events from the configured feed", () => {
    const calB = parseCalendar(FEED_B_ICS);
    const out = mergeCalendars({
      calendars: [calB],
      options: {},
      perFeedOptions: [{ hideAllDay: true }],
    });
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).toContain("SUMMARY:Holiday gathering");
    expect(out).not.toContain("Alice");
  });

  it("feed without hideAllDay keeps all-day events intact", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const calB = parseCalendar(FEED_B_ICS);
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
      perFeedOptions: [{ hideAllDay: true }, {}],
    });
    // Feed B's all-day birthday stays (B does NOT have hideAllDay).
    expect(out).toContain("Alice");
  });
});

describe("legacy string[] back-compat", () => {
  it("validateConfig accepts plain string array (legacy form) and normalizes to SourceConfig", () => {
    const result = validateConfig({
      sources: ["https://a.example.com/cal.ics", "https://b.example.com/cal.ics"],
    });
    expect(result.ok).toBe(true);
    const sources = result.config!.sources.map(normalizeSource);
    expect(sources[0].url).toBe("https://a.example.com/cal.ics");
    expect(sources[0].prefix).toBeUndefined();
    expect(sources[0].busyOnly).toBeUndefined();
    expect(sources[0].hideAllDay).toBeUndefined();
    expect(sources[1].url).toBe("https://b.example.com/cal.ics");
  });

  it("legacy string[] merge produces no prefixes, no per-feed masking, no dropped all-day", () => {
    const calA = parseCalendar(FEED_A_ICS);
    const calB = parseCalendar(FEED_B_ICS);
    // Simulates a legacy token: perFeedOptions not provided.
    const out = mergeCalendars({
      calendars: [calA, calB],
      options: {},
    });
    expect(out).toContain("SUMMARY:Daily standup");
    expect(out).toContain("SUMMARY:Piano lesson");
    expect(out).toContain("Alice"); // all-day birthday preserved
    expect(out).not.toContain("SUMMARY:Busy");
    expect(out).not.toContain("SUMMARY:[");
  });
});

describe("validateConfig per-feed object form", () => {
  it("accepts new per-feed object form with all options", () => {
    const result = validateConfig({
      sources: [
        { url: "https://a.example.com/cal.ics", prefix: "[Work] ", busyOnly: true, hideAllDay: false },
        { url: "https://b.example.com/cal.ics" },
      ],
    });
    expect(result.ok).toBe(true);
    const sources = result.config!.sources.map(normalizeSource);
    expect(sources[0].url).toBe("https://a.example.com/cal.ics");
    expect(sources[0].prefix).toBe("[Work] "); // trailing space preserved by validateConfig
    expect(sources[0].busyOnly).toBe(true);
    expect(sources[1].url).toBe("https://b.example.com/cal.ics");
    expect(sources[1].prefix).toBeUndefined();
  });

  it("rejects a prefix over 40 chars", () => {
    const result = validateConfig({
      sources: [
        { url: "https://a.example.com/cal.ics", prefix: "x".repeat(41) },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/prefix too long/i);
  });

  it("strips only leading whitespace from prefix, ignores whitespace-only prefix", () => {
    // Whitespace-only → dropped entirely.
    const r1 = validateConfig({
      sources: [{ url: "https://a.example.com/cal.ics", prefix: "  " }],
    });
    expect(r1.ok).toBe(true);
    expect(normalizeSource(r1.config!.sources[0]).prefix).toBeUndefined();

    // Leading whitespace stripped, trailing whitespace preserved.
    const r2 = validateConfig({
      sources: [{ url: "https://a.example.com/cal.ics", prefix: "  [Work]  " }],
    });
    expect(r2.ok).toBe(true);
    expect(normalizeSource(r2.config!.sources[0]).prefix).toBe("[Work]  ");
  });

  it("mixed legacy string and object form is accepted", () => {
    const result = validateConfig({
      sources: [
        "https://a.example.com/cal.ics",
        { url: "https://b.example.com/cal.ics", busyOnly: true },
      ],
    });
    expect(result.ok).toBe(true);
    const sources = result.config!.sources.map(normalizeSource);
    expect(sources[0].url).toBe("https://a.example.com/cal.ics");
    expect(sources[0].busyOnly).toBeUndefined();
    expect(sources[1].busyOnly).toBe(true);
  });
});

describe("validateConfig prefix trailing-space regression", () => {
  // These tests lock the fix: validateConfig must preserve trailing whitespace
  // so that "[Work] " becomes "[Work] Meeting" (not "[Work]Meeting") in the feed.

  it("preserves trailing space in '[Work] ' prefix (the canonical placeholder format)", () => {
    const result = validateConfig({
      sources: [{ url: "https://a.example.com/cal.ics", prefix: "[Work] " }],
    });
    expect(result.ok).toBe(true);
    const src = normalizeSource(result.config!.sources[0]);
    // Must be "[Work] " with the trailing space intact.
    expect(src.prefix).toBe("[Work] ");
  });

  it("strips leading whitespace but keeps trailing space: '  [Work] ' → '[Work] '", () => {
    const result = validateConfig({
      sources: [{ url: "https://a.example.com/cal.ics", prefix: "  [Work] " }],
    });
    expect(result.ok).toBe(true);
    const src = normalizeSource(result.config!.sources[0]);
    expect(src.prefix).toBe("[Work] ");
  });

  it("drops a whitespace-only prefix (all spaces → no prefix stored)", () => {
    const result = validateConfig({
      sources: [{ url: "https://a.example.com/cal.ics", prefix: "   " }],
    });
    expect(result.ok).toBe(true);
    const src = normalizeSource(result.config!.sources[0]);
    expect(src.prefix).toBeUndefined();
  });

  it("emoji prefix without trailing space is stored as-is", () => {
    const result = validateConfig({
      sources: [{ url: "https://a.example.com/cal.ics", prefix: "W:" }],
    });
    expect(result.ok).toBe(true);
    const src = normalizeSource(result.config!.sources[0]);
    expect(src.prefix).toBe("W:");
  });
});
