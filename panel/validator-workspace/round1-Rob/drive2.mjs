import { chromium } from 'playwright';

const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

await page.locator('input').first().fill(F1);
await page.locator('input[placeholder*="example.com/calendar-2"]').fill(F2);

// Expand feed1 options, set per-feed mask
const opts = () => page.getByText('Options', { exact: true });
await opts().nth(0).click();
await page.waitForTimeout(200);
await page.getByText("Mask this feed's titles").click();

// Expand feed2 options (re-query fresh), set prefix
await opts().nth(1).click();
await page.waitForTimeout(200);
// prefix input has placeholder [Work]
const prefix = page.locator('input[placeholder="[Work]"]');
console.log('prefix inputs visible:', await prefix.count());
await prefix.nth(1).fill('[CA] ').catch(async () => { await prefix.first().fill('[CA] '); });

await page.screenshot({ path: 'before-create.png', fullPage: true });

// Create feed
await page.getByRole('button', { name: /Create feed/i }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: 'after-create.png', fullPage: true });

const out = await page.locator('body').innerText();
console.log('=== AFTER CREATE BODY ===');
console.log(out.slice(0, 2500));

// Try copy button
const copyBtn = page.getByRole('button', { name: /copy/i });
let copyResult = 'no copy button found';
if (await copyBtn.count()) {
  const before = await copyBtn.first().innerText();
  await copyBtn.first().click();
  await page.waitForTimeout(600);
  const after = await copyBtn.first().innerText();
  let clip = '';
  try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch (e) { clip = 'CLIP_BLOCKED: ' + e.message; }
  copyResult = `label before="${before}" after="${after}" clip="${clip.slice(0,120)}"`;
}
console.log('COPY:', copyResult);

await page.screenshot({ path: 'after-copy.png', fullPage: true });

// Look for a preview of merged events
const previewText = out.toLowerCase();
console.log('mentions Busy in output?', previewText.includes('busy'));

console.log('CONSOLE ERRORS:', errs.length, errs.slice(0,5));
await ctx.close();
await browser.close();
