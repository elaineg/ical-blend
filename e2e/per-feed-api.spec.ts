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
