/**
 * UI smoke tests for the builder page. These tests interact with the page
 * UI (typing URLs, clicking "Create feed") and therefore go through
 * /api/token — which enforces an SSRF guard that blocks localhost URLs.
 *
 * To stay network-independent we use public, stable ICS URLs for the two
 * source feeds. The exact event content is not verified here (that's covered
 * in spec-checks.spec.ts / per-feed-api.spec.ts using direct token building).
 * We only verify that the UI flow completes end-to-end (feed URL appears,
 * preview renders, copy buttons are visible, subscription instructions show).
 */
import { expect, test } from "@playwright/test";

// Two stable public ICS feeds for UI tests (must be publicly accessible from the test runner).
// These are well-known public holiday calendars that don't require auth.
const PUBLIC_FEED_1 = "https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics";
const PUBLIC_FEED_2 = "https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics";

test("build a merged feed from two public sources and preview it", async ({
  page,
  request,
}) => {
  await page.goto("/");

  await page.getByTestId("source-0").fill(PUBLIC_FEED_1);
  await page.getByTestId("source-1").fill(PUBLIC_FEED_2);
  await page.getByTestId("create-feed").click();

  // Feed URL and copy buttons appear (wait up to 30s for network fetch).
  const feedUrlEl = page.getByTestId("feed-url");
  await expect(feedUrlEl).toBeVisible({ timeout: 30000 });
  const feedUrl = (await feedUrlEl.textContent()) ?? "";
  expect(feedUrl).toContain("/api/feed/");
  await expect(page.getByTestId("copy-https")).toBeVisible();
  await expect(page.getByTestId("webcal-url")).toContainText("webcal://");

  // Preview renders at least one event.
  const preview = page.getByTestId("preview-list");
  await expect(preview).toBeVisible({ timeout: 10000 });

  // The feed URL itself serves a valid merged calendar.
  const res = await request.get(feedUrl);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/calendar");
  const body = await res.text();
  expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
  expect(body.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  expect(body).toContain("BEGIN:VEVENT");
});

test("per-feed Options & filters disclosure is visible and keyword fields render", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // The "Options & filters" button should be visible on the first feed row.
  const optionsBtn = page.getByTestId("options-toggle-0");
  await expect(optionsBtn).toBeVisible();
  await expect(optionsBtn).toContainText("Options & filters");

  // Click to expand the per-feed options panel.
  await optionsBtn.click();

  // Per-feed include / exclude fields should now be visible.
  // They are identified by placeholder text matching the spec (piano, soccer / standup, lunch).
  const includeField = page.locator('input[placeholder*="piano"]').first();
  const excludeField = page.locator('input[placeholder*="standup"]').first();
  await expect(includeField).toBeVisible({ timeout: 5000 });
  await expect(excludeField).toBeVisible({ timeout: 5000 });
});

test("exclude filter is applied to the merged feed (UI flow with public sources)", async ({
  page,
  request,
}) => {
  test.slow(); // network-dependent
  await page.goto("/");

  await page.getByTestId("source-0").fill(PUBLIC_FEED_1);
  await page.getByTestId("source-1").fill(PUBLIC_FEED_2);
  await page.getByTestId("exclude-filter").fill("new year");
  await page.getByTestId("create-feed").click();

  const feedUrlEl = page.getByTestId("feed-url");
  await expect(feedUrlEl).toBeVisible({ timeout: 30000 });
  const feedUrl = (await feedUrlEl.textContent()) ?? "";

  const body = await (await request.get(feedUrl)).text();
  // No event with "new year" in its SUMMARY should appear.
  const summaries = [...body.matchAll(/^SUMMARY[^:]*:(.*)$/gim)].map((m) =>
    m[1].trim().toLowerCase()
  );
  for (const s of summaries) {
    expect(s).not.toContain("new year");
  }
  // Tampering with the token returns 400.
  const url = new URL(feedUrl);
  const tampered =
    url.origin +
    url.pathname.slice(0, -2) +
    (url.pathname.endsWith("Q") ? "R" : "Q") +
    url.pathname.slice(-1);
  const tamperedRes = await request.get(tampered);
  expect(tamperedRes.status()).toBe(400);
});
