/**
 * Spec success-check coverage beyond builder.spec.ts. Runs against
 * E2E_BASE_URL when set (deployed verification) or the local dev server.
 *
 * Requires the test fixtures at /api/test-fixture/{work,home} to be enabled
 * on the target (ALLOW_TEST_FIXTURES=1 on deployed targets).
 *
 * NOTE: The /api/token endpoint applies an SSRF guard that blocks localhost
 * URLs — so tests exercising API responses build tokens directly (same
 * encryption path as the server) and hit /api/feed/<token> without going
 * through /api/token. This lets the suite run cleanly against a local prod
 * server without network access to external calendars.
 */
import { expect, test } from "@playwright/test";
import { createCipheriv, randomBytes } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import ical from "node-ical";

// Match the fallback key used in playwright.config.ts (and .env.local in dev).
const FALLBACK_KEY_HEX =
  "5cf0d2bb9d2e4f6a8b1c3d5e7f90a1b2c3d4e5f60718293a4b5c6d7e8f901234";

// Use the real server key if provided, otherwise fall back.
const KEY_HEX = process.env.ENCRYPTION_KEY?.match(/^[0-9a-fA-F]{64}$/)
  ? process.env.ENCRYPTION_KEY
  : FALLBACK_KEY_HEX;

/** Build an encrypted token directly (same algorithm as lib/token.ts encryptConfig). */
function buildToken(config: unknown): string {
  const key = Buffer.from(KEY_HEX, "hex");
  const plain = deflateRawSync(Buffer.from(JSON.stringify(config), "utf8"));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ct, tag]).toString("base64url");
}

test("feed from 2 sources: 200, text/calendar, valid VCALENDAR parsed by node-ical with events from BOTH sources", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
  });
  const feedUrl = `${baseURL}/api/feed/${token}`;
  expect(feedUrl).toMatch(/^https?:\/\/.+\/api\/feed\/[A-Za-z0-9_-]+$/);

  const res = await request.get(feedUrl);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/calendar");

  const body = await res.text();
  expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
  expect(body.trimEnd().endsWith("END:VCALENDAR")).toBe(true);

  // Standards parser parses without error; events from BOTH sources present.
  const parsed = ical.sync.parseICS(body);
  const summaries = Object.values(parsed)
    .filter((c) => c.type === "VEVENT")
    .map((e) => String((e as { summary?: unknown }).summary ?? ""));
  expect(summaries).toContain("Daily standup"); // work source
  expect(summaries).toContain("Piano lesson"); // home source
  expect(summaries.length).toBeGreaterThanOrEqual(6);
});

test("feed response carries Cache-Control with s-maxage of at least 300", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
  });
  const res = await request.get(`${baseURL}/api/feed/${token}`);
  const cc = res.headers()["cache-control"] ?? "";
  const m = cc.match(/s-maxage=(\d+)/);
  expect(m, `cache-control was: "${cc}"`).not.toBeNull();
  expect(Number(m![1])).toBeGreaterThanOrEqual(300);
});

test("include-keyword 'piano': ONLY events whose SUMMARY contains piano appear", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    include: "piano",
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  const summaries = [...body.matchAll(/^SUMMARY[^:]*:(.*)$/gim)].map((m) =>
    m[1].trim()
  );
  expect(summaries.length).toBeGreaterThanOrEqual(2);
  for (const s of summaries) {
    expect(s.toLowerCase()).toContain("piano");
  }
});

test("exclude-keyword 'standup': no VEVENT with standup (any case) in SUMMARY", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    exclude: "standup",
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  const summaries = [...body.matchAll(/^SUMMARY[^:]*:(.*)$/gim)].map((m) =>
    m[1].trim()
  );
  expect(summaries.length).toBeGreaterThanOrEqual(1);
  for (const s of summaries) {
    expect(s.toLowerCase()).not.toContain("standup");
  }
  // Both kept events from other source still present.
  expect(body).toContain("SUMMARY:Piano lesson");
  expect(body).toContain("SUMMARY:Quarterly planning");
});

test("busy-only mask: every SUMMARY is Busy; no DESCRIPTION/LOCATION/ATTENDEE/ORGANIZER; DTSTART/DTEND preserved", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    busyOnly: true,
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  const summaries = [...body.matchAll(/^SUMMARY[^:]*:(.*)$/gim)].map((m) =>
    m[1].trim()
  );
  expect(summaries.length).toBeGreaterThanOrEqual(6);
  for (const s of summaries) expect(s).toBe("Busy");
  expect(body).not.toMatch(/^(DESCRIPTION|LOCATION|ATTENDEE|ORGANIZER)/m);
  expect(body).toMatch(/^DTSTART/m);
  expect(body).toMatch(/^DTEND/m);
});

test("token is opaque: base64url decode reveals no source URLs; tampering returns 400", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
  });

  // Decoded ciphertext must not contain readable source URLs or JSON keys.
  const decoded = Buffer.from(token, "base64url").toString("latin1");
  expect(decoded).not.toContain("test-fixture");
  expect(decoded).not.toContain("http");
  expect(decoded).not.toContain("sources");
  expect(decoded).not.toContain(new URL(baseURL!).hostname);

  // Flip one character in the middle of the token -> 400, not data.
  const mid = Math.floor(token.length / 2);
  const flipped = token[mid] === "A" ? "B" : "A";
  const tampered = token.slice(0, mid) + flipped + token.slice(mid + 1);
  expect(tampered).not.toBe(token);
  const res = await request.get(`${baseURL}/api/feed/${tampered}`);
  expect(res.status()).toBe(400);
});

test("5 source URLs of ~180 chars each produce a merged-feed URL under 2000 characters", async ({
  request,
  baseURL,
}) => {
  const pad = (i: number, target: number) => {
    const base = `${baseURL}/api/test-fixture/${i % 2 === 0 ? "work" : "home"}?src=${i}&pad=`;
    return base + "x".repeat(Math.max(0, target - base.length));
  };
  const sources = [0, 1, 2, 3, 4].map((i) => pad(i, 180));
  for (const s of sources) expect(s.length).toBe(180);

  const token = buildToken({ sources });
  const feedUrl = `${baseURL}/api/feed/${token}`;
  expect(feedUrl.length).toBeLessThan(2000);

  const res = await request.get(feedUrl);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("BEGIN:VEVENT");
});

test("one dead source: feed still 200 with other events merged plus a failure marker event", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/home`,
      `${baseURL}/api/test-fixture/does-not-exist`, // returns 404
    ],
  });
  const res = await request.get(`${baseURL}/api/feed/${token}`);
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("SUMMARY:Piano lesson"); // surviving source merged
  expect(body).toContain("iCal Blend: 1 source failed"); // marker event
});

test("webcal:// source URLs are accepted and normalized", async ({
  request,
  baseURL,
}) => {
  // webcal:// normalizes to https://, so this only works on an https target.
  test.skip(!baseURL!.startsWith("https://"), "needs an https target");
  const host = baseURL!.replace(/^https?:\/\//, "");
  const token = buildToken({
    sources: [
      `webcal://${host}/api/test-fixture/work`,
      `webcal://${host}/api/test-fixture/home`,
    ],
  });
  const res = await request.get(`${baseURL}/api/feed/${token}`);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("SUMMARY:Piano lesson");
});

test("per-feed prefix: work feed prefixed [Work], home feed unprefixed", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      { url: `${baseURL}/api/test-fixture/work`, prefix: "[Work] " },
      { url: `${baseURL}/api/test-fixture/home` },
    ],
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // Work-source events should be prefixed.
  expect(body).toContain("SUMMARY:[Work] Daily standup");
  // Home-source events should NOT be prefixed.
  expect(body).toContain("SUMMARY:Piano lesson");
  expect(body).not.toContain("SUMMARY:[Work] Piano lesson");
});

test("per-feed mask: work feed masked to Busy, home feed stays detailed", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      { url: `${baseURL}/api/test-fixture/work`, busyOnly: true },
      { url: `${baseURL}/api/test-fixture/home` },
    ],
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // Home feed's Piano lesson should be detailed.
  expect(body).toContain("SUMMARY:Piano lesson");
  // Work feed's events should be masked.
  expect(body).toContain("SUMMARY:Busy");
  // No work-specific title should appear unmasked.
  expect(body).not.toContain("SUMMARY:Daily standup");
});

test("per-feed hide-all-day: home feed all-day events dropped, work feed unaffected", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      { url: `${baseURL}/api/test-fixture/work` },
      { url: `${baseURL}/api/test-fixture/home`, hideAllDay: true },
    ],
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // Work events (all timed) should be present.
  expect(body).toContain("SUMMARY:Daily standup");
  // Home timed events should be present.
  expect(body).toContain("SUMMARY:Piano lesson");
  // Spec: home feed all-day events (Birthday, Holiday) absent.
  // (The test fixture home feed contains an all-day Birthday event.)
  const allDayLines = body.match(/DTSTART;VALUE=DATE:[^\r\n]+/g) ?? [];
  // All remaining VALUE=DATE events must come from work fixture (which has none),
  // so there should be zero all-day events from home.
  expect(allDayLines.length).toBe(0);
});

test("back-compat: legacy string[] sources token still merges correctly", async ({
  request,
  baseURL,
}) => {
  // Plain string[] (legacy format) — server must accept and merge as before.
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  expect(body).toContain("SUMMARY:Daily standup");
  expect(body).toContain("SUMMARY:Piano lesson");
  // No prefixes, no masking.
  expect(body).not.toContain("SUMMARY:[");
  expect(body).not.toContain("SUMMARY:Busy");
});

// ─── COMMA-SPLIT FIX (P1): multi-keyword OR filter ───────────────────────────

test("global exclude 'standup, lunch' drops BOTH terms (comma-OR semantics)", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    exclude: "standup, planning",
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // "Daily standup" and "Weekly standup retro" match "standup" → dropped.
  expect(body).not.toContain("standup");
  expect(body).not.toContain("Standup");
  // "Quarterly planning" matches "planning" → dropped.
  expect(body).not.toContain("planning");
  expect(body).not.toContain("Planning");
  // Other events survive.
  expect(body).toContain("SUMMARY:Piano lesson");
});

test("global include 'piano, dentist' keeps BOTH matching events (comma-OR semantics)", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    include: "piano, dentist",
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // Piano events and Dentist events must appear.
  expect(body).toContain("SUMMARY:Piano lesson");
  expect(body).toContain("SUMMARY:Piano recital");
  expect(body).toContain("SUMMARY:Dentist appointment");
  // Work events (no piano or dentist) must not appear.
  expect(body).not.toContain("SUMMARY:Daily standup");
  expect(body).not.toContain("SUMMARY:Quarterly planning");
});

test("per-feed exclude 'standup, planning' on feed A drops both terms; feed B unaffected", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      { url: `${baseURL}/api/test-fixture/work`, exclude: "standup, planning" },
      { url: `${baseURL}/api/test-fixture/home` },
    ],
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // Work feed: all standup and planning events dropped.
  expect(body).not.toContain("SUMMARY:Daily standup");
  expect(body).not.toContain("SUMMARY:Weekly standup retro");
  expect(body).not.toContain("SUMMARY:Quarterly planning");
  // Home feed: all events survive (no per-feed filter).
  expect(body).toContain("SUMMARY:Piano lesson");
  expect(body).toContain("SUMMARY:Dentist appointment");
  expect(body).toContain("Birthday celebration");
});

test("per-feed include 'piano, dentist' on feed B; feed A (work) unaffected", async ({
  request,
  baseURL,
}) => {
  const token = buildToken({
    sources: [
      { url: `${baseURL}/api/test-fixture/work` },
      { url: `${baseURL}/api/test-fixture/home`, include: "piano, dentist" },
    ],
  });
  const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
  // Home: only piano and dentist events.
  expect(body).toContain("SUMMARY:Piano lesson");
  expect(body).toContain("SUMMARY:Dentist appointment");
  expect(body).toContain("SUMMARY:Piano recital");
  expect(body).not.toContain("Birthday celebration");
  // Work: all events present (no per-feed filter).
  expect(body).toContain("SUMMARY:Daily standup");
  expect(body).toContain("SUMMARY:Quarterly planning");
});

test("empty/whitespace exclude = no filter (does not drop all events)", async ({
  request,
  baseURL,
}) => {
  // Guard against the silently-drop-all trap where an empty filter drops everything.
  for (const exclude of ["", "   ", ",,,,"]) {
    const token = buildToken({
      sources: [
        `${baseURL}/api/test-fixture/work`,
        `${baseURL}/api/test-fixture/home`,
      ],
      exclude,
    });
    const body = await (await request.get(`${baseURL}/api/feed/${token}`)).text();
    expect(body, `exclude="${exclude}" should not drop events`).toContain("SUMMARY:Daily standup");
    expect(body, `exclude="${exclude}" should not drop events`).toContain("SUMMARY:Piano lesson");
  }
});
