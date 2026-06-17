import { chromium } from 'playwright';
// Use US feed for BOTH rows to guarantee fetch success; row1 prefix, row2 mask. No hide-all-day so events show.
const F = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const inputs = await page.locator('input[type="text"], input[type="url"]').all();
await inputs[0].fill(F);
await inputs[1].fill(F);

const optBtns = page.locator('button').filter({ hasText: 'Options' });
await optBtns.nth(0).click();
await page.waitForTimeout(300);
await page.getByPlaceholder('[Work]').first().fill('[US] ');

await optBtns.nth(1).click();
await page.waitForTimeout(300);
const masks = page.getByText(/mask this feed.?s titles/i);
await masks.nth(await masks.count() - 1).click();
await page.waitForTimeout(200);

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(10000);
const body = await page.locator('body').innerText();
const idx = body.indexOf('Preview');
console.log(body.slice(idx, idx + 1400));
await page.screenshot({ path: 'verify-rules.png', fullPage: true });
await browser.close();
