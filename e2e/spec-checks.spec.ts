/**
 * Spec success-check coverage beyond builder.spec.ts. Runs against
 * E2E_BASE_URL when set (deployed verification) or the local dev server.
 *
 * Requires the test fixtures at /api/test-fixture/{work,home} to be enabled
 * on the target (ALLOW_TEST_FIXTURES=1 on deployed targets).
 */
import { expect, test } from "@playwright/test";
import ical from "node-ical";

async function createToken(
  request: import("@playwright/test").APIRequestContext,
  baseURL: string,
  body: Record<string, unknown>
) {
  const res = await request.post(`${baseURL}/api/token`, { data: body });
  expect(res.status(), await res.text()).toBe(200);
  return (await res.json()) as { token: string; feedPath: string };
}

test("feed from 2 sources: 200, text/calendar, valid VCALENDAR parsed by node-ical with events from BOTH sources", async ({
  request,
  baseURL,
}) => {
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
  });
  const feedUrl = `${baseURL}${feedPath}`;
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
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
  });
  const res = await request.get(`${baseURL}${feedPath}`);
  const cc = res.headers()["cache-control"] ?? "";
  const m = cc.match(/s-maxage=(\d+)/);
  expect(m, `cache-control was: "${cc}"`).not.toBeNull();
  expect(Number(m![1])).toBeGreaterThanOrEqual(300);
});

test("include-keyword 'piano': ONLY events whose SUMMARY contains piano appear", async ({
  request,
  baseURL,
}) => {
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    include: "piano",
  });
  const body = await (await request.get(`${baseURL}${feedPath}`)).text();
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
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    exclude: "standup",
  });
  const body = await (await request.get(`${baseURL}${feedPath}`)).text();
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
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `${baseURL}/api/test-fixture/work`,
      `${baseURL}/api/test-fixture/home`,
    ],
    busyOnly: true,
  });
  const body = await (await request.get(`${baseURL}${feedPath}`)).text();
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
  const { token } = await createToken(request, baseURL!, {
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

test("5 source URLs of ~180 chars each produce a merged-feed URL under 2000 chars", async ({
  request,
  baseURL,
}) => {
  const pad = (i: number, target: number) => {
    const base = `${baseURL}/api/test-fixture/${i % 2 === 0 ? "work" : "home"}?src=${i}&pad=`;
    return base + "x".repeat(Math.max(0, target - base.length));
  };
  const sources = [0, 1, 2, 3, 4].map((i) => pad(i, 180));
  for (const s of sources) expect(s.length).toBe(180);

  const { feedPath } = await createToken(request, baseURL!, { sources });
  const feedUrl = `${baseURL}${feedPath}`;
  expect(feedUrl.length).toBeLessThan(2000);

  const res = await request.get(feedUrl);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("BEGIN:VEVENT");
});

test("one dead source: feed still 200 with other events merged plus a failure marker event", async ({
  request,
  baseURL,
}) => {
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `${baseURL}/api/test-fixture/home`,
      `${baseURL}/api/test-fixture/does-not-exist`, // returns 404
    ],
  });
  const res = await request.get(`${baseURL}${feedPath}`);
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
  const { feedPath } = await createToken(request, baseURL!, {
    sources: [
      `webcal://${host}/api/test-fixture/work`,
      `webcal://${host}/api/test-fixture/home`,
    ],
  });
  const res = await request.get(`${baseURL}${feedPath}`);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("SUMMARY:Piano lesson");
});
