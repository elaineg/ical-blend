import { chromium } from 'playwright';

const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 375, height: 720 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERR ' + e.message));

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const feedInputs = page.locator('input[placeholder*="calendar"], input[placeholder*="ics"], input[placeholder*="http"]');
await feedInputs.nth(0).fill(F1);
await feedInputs.nth(1).fill(F2);
await page.getByText('Options', { exact: false }).nth(0).click();
await page.waitForTimeout(200);
await page.locator('input[placeholder*="Work"], input[placeholder*="["], input[placeholder*="Release"]').nth(0).fill('[Release] ');

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(4000);
await page.screenshot({ path: 'created.png', fullPage: true });

// Find the result/share URL
const bodyText = await page.locator('body').innerText();
console.log('--- BODY AFTER CREATE (first 1500) ---');
console.log(bodyText.slice(0, 1500));

// Look for copy button
const copyBtn = page.getByRole('button', { name: /copy/i });
console.log('copy btns:', await copyBtn.count());
if (await copyBtn.count() > 0) {
  await copyBtn.nth(0).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'copied.png', fullPage: true });
  const labels = await page.getByRole('button').allTextContents();
  console.log('buttons after copy:', JSON.stringify(labels.filter(l=>/copy|copied/i.test(l))));
  try {
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    console.log('CLIPBOARD:', clip.slice(0, 120));
  } catch(e) { console.log('clipboard read blocked:', e.message); }
}

// Try to find a preview section / link
const previewLinks = await page.locator('a').allTextContents();
console.log('links:', JSON.stringify(previewLinks.slice(0,15)));

await browser.close();
console.log('ERRORS:', JSON.stringify(errs));
