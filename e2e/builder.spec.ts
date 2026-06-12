import { expect, test } from "@playwright/test";

test("build a merged feed from two mock sources and preview it", async ({
  page,
  baseURL,
  request,
}) => {
  await page.goto("/");

  await page.getByTestId("source-0").fill(`${baseURL}/api/test-fixture/work`);
  await page.getByTestId("source-1").fill(`${baseURL}/api/test-fixture/home`);
  await page.getByTestId("create-feed").click();

  // Feed URL and copy buttons appear.
  const feedUrlEl = page.getByTestId("feed-url");
  await expect(feedUrlEl).toBeVisible();
  const feedUrl = (await feedUrlEl.textContent()) ?? "";
  expect(feedUrl).toContain("/api/feed/");
  await expect(page.getByTestId("copy-https")).toBeVisible();
  await expect(page.getByTestId("webcal-url")).toContainText("webcal://");

  // Preview renders events from BOTH sources.
  const preview = page.getByTestId("preview-list");
  await expect(preview).toBeVisible();
  await expect(preview).toContainText("Daily standup");
  await expect(preview).toContainText("Piano lesson");

  // The feed URL itself serves a valid merged calendar.
  const res = await request.get(feedUrl);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/calendar");
  expect(res.headers()["cache-control"]).toContain("s-maxage=300");
  const body = await res.text();
  expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
  expect(body.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  expect(body).toContain("SUMMARY:Daily standup");
  expect(body).toContain("SUMMARY:Piano lesson");
});

test("exclude filter and busy mask are applied to the feed", async ({
  page,
  baseURL,
  request,
}) => {
  await page.goto("/");

  await page.getByTestId("source-0").fill(`${baseURL}/api/test-fixture/work`);
  await page.getByTestId("source-1").fill(`${baseURL}/api/test-fixture/home`);
  await page.getByTestId("exclude-filter").fill("standup");
  await page.getByTestId("busy-only").check();
  await page.getByTestId("create-feed").click();

  const feedUrl = (await page.getByTestId("feed-url").textContent()) ?? "";
  const body = await (await request.get(feedUrl)).text();
  expect(body).not.toContain("standup");
  expect(body).not.toContain("Standup");
  expect(body).toContain("SUMMARY:Busy");
  expect(body).not.toContain("SUMMARY:Piano lesson");
  expect(body).not.toMatch(/^(DESCRIPTION|LOCATION|ATTENDEE|ORGANIZER)/m);
  expect(body).toMatch(/^DTSTART/m);

  // Tampering with the token returns 400, not data.
  const url = new URL(feedUrl);
  const tampered =
    url.origin +
    url.pathname.slice(0, -2) +
    (url.pathname.endsWith("Q") ? "R" : "Q") +
    url.pathname.slice(-1);
  const tamperedRes = await request.get(tampered);
  expect(tamperedRes.status()).toBe(400);
});
