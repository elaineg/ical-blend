/**
 * E2E tests for per-feed merge rules, exercised at the /api/feed/<token> level.
 *
 * WHY A SEPARATE FILE: The SSRF guard in validateConfig (correctly) blocks
 * http://localhost:* as a calendar source URL, so the standard test pattern
 * (POST /api/token with fixture URLs, then GET /api/feed/<token>) fails locally.
 *
 * These tests bypass that by:
 * 1. Building tokens directly via encryptConfig (same library as the server uses).
 * 2. Using real public ICS fixture bytes embedded in the token via a per-test
 *    HTTP server stub — NOT by routing through /api/token SSRF validation.
 *
 * Specifically, we create tokens carrying localhost fixture URLs, which the
 * /api/feed/<token> route will fetch from the local test fixture endpoint
 * (ALLOW_TEST_FIXTURES=1 must be set on the target). The SSRF guard lives in
 * validateConfig (token creation), not in buildBlend (feed serving) — so a
 * pre-built token with a localhost URL is valid for the feed route.
 *
 * For each spec success check the assertion is made against the ACTUAL /api/feed
 * response body, parsed with string matching or node-ical.
 */
import { test, expect } from "@playwright/test";
import { createCipheriv, randomBytes } from "node:crypto";
import { deflateRawSync } from "node:zlib";

// The same ENCRYPTION_KEY used by playwright.config.ts as a fallback.
const FALLBACK_KEY_HEX =
  "5cf0d2bb9d2e4f6a8b1c3d5e7f90a1b2c3d4e5f60718293a4b5c6d7e8f901234";

function buildToken(config: unknown, keyHex: string = FALLBACK_KEY_HEX): string {
  const key = Buffer.from(keyHex, "hex");
  const plain = deflateRawSync(Buffer.from(JSON.stringify(config), "utf8"));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ct, tag]).toString("base64url");
}

// Read the real ENCRYPTION_KEY from environment (set by serve-local / .env.local).
// Falls back to the playwright.config.ts dev key for CI/local runs.
const KEY_HEX = process.env.ENCRYPTION_KEY?.match(/^[0-9a-fA-F]{64}$/)
  ? process.env.ENCRYPTION_KEY
  : FALLBACK_KEY_HEX;

test.describe("per-feed prefix (token round-trip + feed output)", () => {
  test("work feed prefixed [Work], home feed events unchanged", async ({
    request,
    baseURL,
  }) => {
    // Use "[Work] " (trailing space) — the user types this to separate the label
    // from the event title. validateConfig preserves trailing whitespace.
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, prefix: "[Work] " },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status(), "feed route status").toBe(200);
    const body = await res.text();

    // Work-source events must carry prefix (with trailing space acting as separator).
    expect(body).toContain("SUMMARY:[Work] Daily standup");
    expect(body).toContain("SUMMARY:[Work] Quarterly planning");
    // Home-source events must NOT be prefixed.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).not.toContain("SUMMARY:[Work] Piano lesson");
    // No home event gets the prefix.
    expect(body).not.toContain("SUMMARY:[Work] Dentist appointment");
  });
});

test.describe("per-feed busy mask (token round-trip + feed output)", () => {
  test("work feed masked to Busy, home feed stays detailed", async ({
    request,
    baseURL,
  }) => {
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, busyOnly: true },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status(), "feed route status").toBe(200);
    const body = await res.text();

    // Home feed keeps real titles.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("SUMMARY:Dentist appointment");
    // Work feed events are masked.
    expect(body).toContain("SUMMARY:Busy");
    expect(body).not.toContain("SUMMARY:Daily standup");
    expect(body).not.toContain("SUMMARY:Quarterly planning");
  });

  test("global busyOnly masks ALL feeds (regression)", async ({
    request,
    baseURL,
  }) => {
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work` },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
        busyOnly: true,
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    const summaryLines = body.match(/^SUMMARY[^:]*:(.*)$/gim) ?? [];
    expect(summaryLines.length).toBeGreaterThanOrEqual(6);
    for (const line of summaryLines) {
      // Trim potential CRLF or whitespace after content.
      expect(line.replace(/\s+$/, "")).toBe("SUMMARY:Busy");
    }
  });

  test("prefix + per-feed mask composes to '[Work] Busy'", async ({
    request,
    baseURL,
  }) => {
    // Use "[Work] " (trailing space) to match the canonical placeholder format.
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, prefix: "[Work] ", busyOnly: true },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    // Work-feed events must be "[Work] Busy".
    expect(body).toContain("SUMMARY:[Work] Busy");
    // "SUMMARY:Busy" alone (bare, without prefix) should not appear for work events.
    // Home events keep their real titles.
    expect(body).toContain("SUMMARY:Piano lesson");
    // No unmasked work title should appear.
    expect(body).not.toContain("SUMMARY:Daily standup");
    expect(body).not.toContain("SUMMARY:[Work] Daily standup");
  });
});

test.describe("per-feed hide-all-day (token round-trip + feed output)", () => {
  test("home feed all-day events dropped, work feed + home timed events remain", async ({
    request,
    baseURL,
  }) => {
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work` },
          { url: `${baseURL}/api/test-fixture/home`, hideAllDay: true },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    // Work events (all timed) present.
    expect(body).toContain("SUMMARY:Daily standup");
    // Home timed events present.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("SUMMARY:Dentist appointment");
    // Home all-day event (Birthday celebration) must be gone.
    expect(body).not.toContain("Birthday celebration");
    // Zero VALUE=DATE lines remain (work fixture has no all-day events).
    const allDayLines = body.match(/DTSTART;VALUE=DATE:[^\r\n]+/g) ?? [];
    expect(allDayLines.length).toBe(0);
  });
});

test.describe("back-compat: legacy string[] sources (token round-trip + feed output)", () => {
  test("plain string[] config merges with no prefixes, no masking, no dropped all-day", async ({
    request,
    baseURL,
  }) => {
    const token = buildToken(
      {
        sources: [
          `${baseURL}/api/test-fixture/work`,
          `${baseURL}/api/test-fixture/home`,
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    // Both feeds merged.
    expect(body).toContain("SUMMARY:Daily standup");
    expect(body).toContain("SUMMARY:Piano lesson");
    // All-day event NOT dropped.
    expect(body).toContain("Birthday celebration");
    // No prefix applied.
    expect(body).not.toContain("SUMMARY:[");
    // No masking.
    expect(body).not.toContain("SUMMARY:Busy");
  });
});

test.describe("per-feed include keyword (token round-trip + feed output)", () => {
  test("only events matching per-feed include appear from that feed; other feed is unaffected", async ({
    request,
    baseURL,
  }) => {
    // Work feed: include "standup" → only "Daily standup" and "Weekly standup retro" survive
    // Home feed: no per-feed filter → all events survive
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, include: "standup" },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status(), "feed route status").toBe(200);
    const body = await res.text();

    // Work: standup events present.
    expect(body).toContain("SUMMARY:Daily standup");
    expect(body).toContain("SUMMARY:Weekly standup retro");
    // Work: non-standup event absent.
    expect(body).not.toContain("SUMMARY:Quarterly planning");
    // Home: all events present.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("SUMMARY:Dentist appointment");
    expect(body).toContain("Birthday celebration");
  });
});

test.describe("per-feed exclude keyword (token round-trip + feed output)", () => {
  test("events matching per-feed exclude are dropped from that feed only; other feed unaffected", async ({
    request,
    baseURL,
  }) => {
    // Work feed: exclude "standup" → standup events gone
    // Home feed: no per-feed filter → all events survive (including Piano events)
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, exclude: "standup" },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status(), "feed route status").toBe(200);
    const body = await res.text();

    // Work: standup events absent.
    expect(body).not.toContain("SUMMARY:Daily standup");
    expect(body).not.toContain("SUMMARY:Weekly standup retro");
    // Work: non-standup event present.
    expect(body).toContain("SUMMARY:Quarterly planning");
    // Home: all events present (no per-feed exclude on home).
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("SUMMARY:Dentist appointment");
    expect(body).toContain("Birthday celebration");
  });
});

test.describe("per-feed + global keyword compose AND (token round-trip + feed output)", () => {
  test("event must pass both per-feed and global include/exclude to appear", async ({
    request,
    baseURL,
  }) => {
    // Work: per-feed include "piano" → no work event has "piano" → nothing from work
    // Home: per-feed include "piano" → only Piano events from home
    // Global exclude "standup" → also drops any standup remaining
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, include: "piano" },
          { url: `${baseURL}/api/test-fixture/home`, include: "piano" },
        ],
        exclude: "standup",
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status(), "feed route status").toBe(200);
    const body = await res.text();

    // Work: nothing survives (no "piano" events in work feed).
    expect(body).not.toContain("SUMMARY:Daily standup");
    expect(body).not.toContain("SUMMARY:Quarterly planning");
    // Home: only Piano events survive.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("SUMMARY:Piano recital");
    expect(body).not.toContain("SUMMARY:Dentist appointment");
  });
});

test.describe("per-feed keyword back-compat: per-feed objects without keyword fields", () => {
  test("per-feed option objects lacking include/exclude merge identically to before", async ({
    request,
    baseURL,
  }) => {
    // Objects with only prefix set — no include/exclude — should behave the same as no per-feed keywords
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, prefix: "[W] " },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    // All work events present with prefix, no filtering.
    expect(body).toContain("SUMMARY:[W] Daily standup");
    expect(body).toContain("SUMMARY:[W] Quarterly planning");
    expect(body).toContain("SUMMARY:[W] Weekly standup retro");
    // All home events present.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("Birthday celebration");
  });
});

// ─── BACK-COMPAT BYTE-FOR-BYTE: legacy string[] vs per-feed object without keywords ─────────────

test.describe("back-compat byte-for-byte: legacy string[] == per-feed object without include/exclude", () => {
  test("legacy string[] sources and per-feed objects (no keyword fields) yield identical event sets", async ({
    request,
    baseURL,
  }) => {
    // Legacy: plain string[] — pre-feature format
    const legacyToken = buildToken(
      {
        sources: [
          `${baseURL}/api/test-fixture/work`,
          `${baseURL}/api/test-fixture/home`,
        ],
      },
      KEY_HEX
    );
    // New format: per-feed objects without include/exclude (back-compat path)
    const newToken = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work` },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );

    const [legacyRes, newRes] = await Promise.all([
      request.get(`${baseURL}/api/feed/${legacyToken}`),
      request.get(`${baseURL}/api/feed/${newToken}`),
    ]);
    expect(legacyRes.status()).toBe(200);
    expect(newRes.status()).toBe(200);

    const legacyBody = await legacyRes.text();
    const newBody = await newRes.text();

    // Both must contain all events from both sources — no filtering added.
    for (const summary of ["Daily standup", "Quarterly planning", "Weekly standup retro", "Piano lesson", "Dentist appointment", "Birthday celebration", "Piano recital"]) {
      expect(legacyBody).toContain(`SUMMARY:${summary}`);
      expect(newBody).toContain(`SUMMARY:${summary}`);
    }

    // Neither should have prefix, masking, or filtering applied.
    expect(legacyBody).not.toContain("SUMMARY:[");
    expect(legacyBody).not.toContain("SUMMARY:Busy");
    expect(newBody).not.toContain("SUMMARY:[");
    expect(newBody).not.toContain("SUMMARY:Busy");

    // Event counts must match (same number of VEVENTs).
    const countVevents = (s: string) => (s.match(/^BEGIN:VEVENT\r?$/gm) ?? []).length;
    expect(countVevents(legacyBody)).toBe(countVevents(newBody));
  });
});

// ─── EMPTY/ABSENT = NO FILTER (API-level silently-wrong-output guard) ─────────

test.describe("empty/absent per-feed keyword = no filter (API level)", () => {
  test("empty include string in per-feed object does NOT drop any events", async ({
    request,
    baseURL,
  }) => {
    // An empty include string must be treated as match-all — no events dropped.
    // This is the key silently-wrong-output guard: if "" is mistakenly treated as
    // "include only events with empty SUMMARY", all events would be dropped.
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, include: "" },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    // ALL work events must be present (empty include = match-all).
    expect(body).toContain("SUMMARY:Daily standup");
    expect(body).toContain("SUMMARY:Quarterly planning");
    expect(body).toContain("SUMMARY:Weekly standup retro");
    // ALL home events must be present.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("Birthday celebration");
  });

  test("empty exclude string in per-feed object does NOT drop any events", async ({
    request,
    baseURL,
  }) => {
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, exclude: "" },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );
    const res = await request.get(`${baseURL}/api/feed/${token}`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    // ALL work events must be present (empty exclude = drop-none).
    expect(body).toContain("SUMMARY:Daily standup");
    expect(body).toContain("SUMMARY:Quarterly planning");
    expect(body).toContain("SUMMARY:Weekly standup retro");
    // ALL home events must be present.
    expect(body).toContain("SUMMARY:Piano lesson");
    expect(body).toContain("Birthday celebration");
  });
});

// ─── PREVIEW==EXPORT: flow-3 preview matches /api/feed export ────────────────

test.describe("PREVIEW==EXPORT: preview event set matches actual feed export", () => {
  test("per-feed include filter: preview summaries match exported VEVENT summaries", async ({
    request,
    baseURL,
  }) => {
    // Work feed: include "standup" → only standup events from work
    // Home feed: no filter → all events
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, include: "standup" },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );

    const [previewRes, feedRes] = await Promise.all([
      request.get(`${baseURL}/api/feed/${token}?preview=json`),
      request.get(`${baseURL}/api/feed/${token}`),
    ]);

    expect(previewRes.status()).toBe(200);
    expect(feedRes.status()).toBe(200);

    const preview = await previewRes.json() as { events: Array<{summary: string}> };
    const feedBody = await feedRes.text();

    // Extract summaries from preview.
    const previewSummaries = new Set(preview.events.map((e) => e.summary));

    // Extract summaries from the exported ICS.
    const exportSummaries = new Set(
      (feedBody.match(/^SUMMARY:[^\r\n]+/gm) ?? []).map((l) => l.slice(8).trim())
    );

    // Every preview summary must appear in the export.
    for (const s of previewSummaries) {
      expect(exportSummaries.has(s), `Preview summary "${s}" not in export`).toBe(true);
    }

    // Verify per-feed include filter is reflected: Quarterly planning (work, no standup) must not appear.
    expect(previewSummaries.has("Quarterly planning")).toBe(false);
    expect(exportSummaries.has("Quarterly planning")).toBe(false);

    // Standup events from work must appear in both.
    expect(previewSummaries.has("Daily standup")).toBe(true);
    expect(exportSummaries.has("Daily standup")).toBe(true);

    // Home events must appear in both.
    expect(previewSummaries.has("Piano lesson")).toBe(true);
    expect(exportSummaries.has("Piano lesson")).toBe(true);
  });

  test("per-feed exclude filter: preview summaries match exported VEVENT summaries", async ({
    request,
    baseURL,
  }) => {
    // Work feed: exclude "standup" → standup events gone from work
    // Home feed: no filter
    const token = buildToken(
      {
        sources: [
          { url: `${baseURL}/api/test-fixture/work`, exclude: "standup" },
          { url: `${baseURL}/api/test-fixture/home` },
        ],
      },
      KEY_HEX
    );

    const [previewRes, feedRes] = await Promise.all([
      request.get(`${baseURL}/api/feed/${token}?preview=json`),
      request.get(`${baseURL}/api/feed/${token}`),
    ]);

    expect(previewRes.status()).toBe(200);
    expect(feedRes.status()).toBe(200);

    const preview = await previewRes.json() as { events: Array<{summary: string}> };
    const feedBody = await feedRes.text();

    const previewSummaries = new Set(preview.events.map((e) => e.summary));
    const exportSummaries = new Set(
      (feedBody.match(/^SUMMARY:[^\r\n]+/gm) ?? []).map((l) => l.slice(8).trim())
    );

    // Every preview summary must appear in the export (no phantom preview events).
    for (const s of previewSummaries) {
      expect(exportSummaries.has(s), `Preview summary "${s}" not in export`).toBe(true);
    }

    // Standup events excluded from work must not appear in either.
    expect(previewSummaries.has("Daily standup")).toBe(false);
    expect(exportSummaries.has("Daily standup")).toBe(false);
    expect(previewSummaries.has("Weekly standup retro")).toBe(false);
    expect(exportSummaries.has("Weekly standup retro")).toBe(false);

    // Quarterly planning (not standup) kept in both.
    expect(exportSummaries.has("Quarterly planning")).toBe(true);

    // Home events preserved in both.
    expect(previewSummaries.has("Piano lesson")).toBe(true);
    expect(exportSummaries.has("Piano lesson")).toBe(true);
  });
});
