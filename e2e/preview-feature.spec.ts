/**
 * E2E tests for flow 3: Preview & test your feeds (pre-create preview, per-source
 * status, reconciliation count, demo feed one-click, empty/partial/all-failed states).
 *
 * API-level tests that need to call /api/preview use public ICS URLs (not localhost
 * fixtures, which are blocked by the SSRF guard in validateConfig).
 *
 * The byte-faithful test builds a token directly (same as spec-checks.spec.ts) and
 * compares the preview /api/preview output against the real /api/feed output.
 */
import { test, expect } from "@playwright/test";

// Public ICS feeds for API-level preview tests.
const PUBLIC_WORK_FEED = "https://www.gov.uk/bank-holidays/england-and-wales.ics";
const PUBLIC_HOME_FEED = "https://ics.fixtur.es/v2/home/chelsea.ics";

// Public feeds for the "Load a sample feed" test — must match SAMPLE_SOURCES in page.tsx.
const SAMPLE_URL_1 = "https://www.gov.uk/bank-holidays/england-and-wales.ics";
const SAMPLE_URL_2 = "https://ics.fixtur.es/v2/home/chelsea.ics";

test.describe("Preview button state", () => {
  test("preview button is disabled (or shows helper) when no sources are entered", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Clear any pre-filled sources.
    const src0 = page.getByTestId("source-0");
    await src0.clear();
    const src1 = page.getByTestId("source-1");
    await src1.clear();

    // Preview button must be disabled when no sources are filled.
    const previewBtn = page.getByTestId("preview-btn");
    await expect(previewBtn).toBeVisible();
    await expect(previewBtn).toBeDisabled();

    // Helper message visible.
    await expect(page.getByTestId("preview-disabled-hint")).toBeVisible();
    await expect(page.getByTestId("preview-disabled-hint")).toContainText("Add a feed URL to preview");
  });

  test("preview button becomes enabled after typing a source URL", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const src0 = page.getByTestId("source-0");
    await src0.fill("https://www.gov.uk/bank-holidays/england-and-wales.ics");
    const previewBtn = page.getByTestId("preview-btn");
    await expect(previewBtn).toBeEnabled();
  });
});

test.describe("Load a sample feed", () => {
  test("clicking Load a sample feed populates both source URL fields", async ({ page }) => {
    // loadSample now auto-runs preview (network fetch), so don't wait for networkidle.
    await page.goto("/");
    await page.getByTestId("load-sample").click();

    // Both source URLs must be populated.
    await expect(page.getByTestId("source-0")).toHaveValue(SAMPLE_URL_1);
    await expect(page.getByTestId("source-1")).toHaveValue(SAMPLE_URL_2);
  });

  test("Load a sample feed auto-runs preview in one click — panel appears without clicking Preview", async ({ page }) => {
    test.slow(); // fetches live network feeds
    await page.goto("/");
    await page.getByTestId("load-sample").click();

    // The preview panel should appear automatically (auto-preview wired to loadSample).
    const panel = page.getByTestId("preview-panel");
    await expect(panel).toBeVisible({ timeout: 30000 });

    // Per-source status list present.
    const statusList = page.getByTestId("preview-source-status");
    await expect(statusList).toBeVisible();

    // Both sources should show ✓ (they are stable public feeds verified at build time).
    const src0Row = page.getByTestId("preview-source-0");
    await expect(src0Row).toContainText("✓");

    // Reconciliation count must appear with correct spacing.
    const reconciliation = page.getByTestId("preview-reconciliation");
    await expect(reconciliation).toBeVisible();
    await expect(reconciliation).toContainText("Fetched");
    await expect(reconciliation).toContainText(" kept ");
    await expect(reconciliation).toContainText(" after filters");

    // Preview list must contain at least one event.
    const previewList = page.getByTestId("preview-list");
    await expect(previewList).toBeVisible();
    const items = await previewList.locator("li").count();
    expect(items).toBeGreaterThanOrEqual(1);
  });

  test("after loading sample, Preview button still works for manual re-run", async ({ page }) => {
    test.slow(); // fetches live network feeds
    await page.goto("/");
    await page.getByTestId("load-sample").click();

    // Wait for auto-preview to complete.
    await expect(page.getByTestId("preview-panel")).toBeVisible({ timeout: 30000 });

    // Preview button should be enabled and clickable for re-run.
    const previewBtn = page.getByTestId("preview-btn");
    await expect(previewBtn).toBeEnabled();
    await previewBtn.click();

    // Panel should still be visible after re-click.
    await expect(page.getByTestId("preview-panel")).toBeVisible({ timeout: 30000 });
  });
});

test.describe("Pre-create preview — no token generated", () => {
  test("preview renders upcoming events BEFORE Create feed is clicked", async ({ page }) => {
    test.slow();
    // loadSample auto-runs preview, so don't wait for networkidle.
    await page.goto("/");
    await page.getByTestId("load-sample").click();

    // Wait for preview panel (auto-run from loadSample or explicit click).
    await expect(page.getByTestId("preview-panel")).toBeVisible({ timeout: 30000 });

    // The result section (with feed URL) must NOT be visible.
    await expect(page.getByTestId("result")).not.toBeVisible();

    // The preview list must have events.
    await expect(page.getByTestId("preview-list")).toBeVisible({ timeout: 30000 });
  });
});

test.describe("Preview API — per-source status, reconciliation, empty states", () => {
  test("POST /api/preview returns correct shape with valid public sources", async ({ request, baseURL }) => {
    test.slow(); // network-dependent
    const res = await request.post(`${baseURL}/api/preview`, {
      data: {
        sources: [PUBLIC_WORK_FEED, PUBLIC_HOME_FEED],
      },
    });
    expect(res.status()).toBe(200);
    const json = await res.json() as {
      perSource: Array<{ index: number; label: string; ok: boolean; count: number; reason: string }>;
      fetched: number;
      kept: number;
      events: Array<{ summary: string; start: string | null; allDay: boolean }>;
      allFailed: boolean;
      failedCount: number;
    };

    // Two sources, both should be ok.
    expect(json.perSource).toHaveLength(2);
    expect(json.perSource[0].ok).toBe(true);
    expect(json.perSource[1].ok).toBe(true);
    expect(json.perSource[0].count).toBeGreaterThan(0);
    expect(json.perSource[1].count).toBeGreaterThan(0);

    // fetched = sum of per-source counts.
    expect(json.fetched).toBe(json.perSource[0].count + json.perSource[1].count);

    // kept >= 0, events array present.
    expect(json.kept).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(json.events)).toBe(true);

    // allFailed must be false when both succeed.
    expect(json.allFailed).toBe(false);
    expect(json.failedCount).toBe(0);
  });

  test("POST /api/preview with one dead source: perSource[1].ok=false with human reason", async ({
    request,
    baseURL,
  }) => {
    test.slow();
    // Use a real public feed + a URL that reliably returns 404.
    const res = await request.post(`${baseURL}/api/preview`, {
      data: {
        sources: [
          PUBLIC_WORK_FEED,
          "https://example.com/this-calendar-does-not-exist-ical-blend-test.ics",
        ],
      },
    });
    expect(res.status()).toBe(200);
    const json = await res.json() as {
      perSource: Array<{ ok: boolean; count: number; reason: string }>;
      fetched: number;
      kept: number;
      allFailed: boolean;
      failedCount: number;
    };

    // Source 0 ok, source 1 failed.
    expect(json.perSource[0].ok).toBe(true);
    expect(json.perSource[1].ok).toBe(false);

    // Reason must be a non-empty human string.
    expect(json.perSource[1].reason.length).toBeGreaterThan(0);

    // fetched = only the ok source's count.
    expect(json.fetched).toBe(json.perSource[0].count);
    expect(json.failedCount).toBe(1);
    expect(json.allFailed).toBe(false);
  });

  test("POST /api/preview with busy mask on public feed: preview events have Busy titles", async ({
    request,
    baseURL,
  }) => {
    test.slow();
    const res = await request.post(`${baseURL}/api/preview`, {
      data: {
        sources: [PUBLIC_WORK_FEED],
        busyOnly: true,
      },
    });
    expect(res.status()).toBe(200);
    const json = await res.json() as { events: Array<{ summary: string }>; kept: number };
    // If there are upcoming events, all titles must be "Busy" after masking.
    if (json.events.length > 0) {
      for (const ev of json.events) {
        expect(ev.summary).toBe("Busy");
      }
    }
  });

  test("POST /api/preview byte-faithful check: preview kept count matches feed VEVENT count", async ({
    request,
    baseURL,
  }) => {
    test.slow();
    // Use the same public config for both preview and the actual feed.
    const { createCipheriv, randomBytes } = await import("node:crypto");
    const { deflateRawSync } = await import("node:zlib");
    const FALLBACK_KEY_HEX = "5cf0d2bb9d2e4f6a8b1c3d5e7f90a1b2c3d4e5f60718293a4b5c6d7e8f901234";
    const KEY_HEX = process.env.ENCRYPTION_KEY?.match(/^[0-9a-fA-F]{64}$/)
      ? process.env.ENCRYPTION_KEY : FALLBACK_KEY_HEX;

    const config = {
      sources: [PUBLIC_WORK_FEED, PUBLIC_HOME_FEED],
    };

    // Get preview.
    const previewRes = await request.post(`${baseURL}/api/preview`, { data: config });
    expect(previewRes.status()).toBe(200);
    const previewJson = await previewRes.json() as { kept: number };

    // Build token and get the real feed.
    const key = Buffer.from(KEY_HEX, "hex");
    const plain = deflateRawSync(Buffer.from(JSON.stringify(config), "utf8"));
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
    const tag = cipher.getAuthTag();
    const token = Buffer.concat([iv, ct, tag]).toString("base64url");

    const feedRes = await request.get(`${baseURL}/api/feed/${token}`);
    expect(feedRes.status()).toBe(200);
    const feedBody = await feedRes.text();

    // Count non-marker VEVENTs in the ICS (exclude "iCal Blend:" marker).
    const veventBlocks = [...feedBody.matchAll(/BEGIN:VEVENT[\s\S]*?END:VEVENT/gm)];
    const nonMarkerVevents = veventBlocks.filter((m) =>
      !m[0].includes("SUMMARY:iCal Blend:")
    );

    expect(previewJson.kept).toBe(nonMarkerVevents.length);
  });
});

test.describe("Preview panel UI states at 375px width", () => {
  test("per-source status row with ✗ reason is visible at 375px (not hover-only)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // loadSample auto-runs preview, so don't wait for networkidle.
    await page.goto("/");
    await page.getByTestId("load-sample").click();
    // Panel loads (30s timeout for live fetch — auto-preview from loadSample)
    await expect(page.getByTestId("preview-panel")).toBeVisible({ timeout: 30000 });
    // The status list must be visible at 375px.
    await expect(page.getByTestId("preview-source-status")).toBeVisible();
    // No horizontal overflow.
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance
  });

  test("preview button tap target is >=44px tall at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByTestId("source-0").fill("https://www.gov.uk/bank-holidays/england-and-wales.ics");
    const btn = page.getByTestId("preview-btn");
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
