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

// Fill first two feed inputs
const inputs = page.locator('input[type="text"], input[type="url"], input:not([type])');
// Find feed URL inputs by placeholder
const feedInputs = page.locator('input[placeholder*="calendar"], input[placeholder*="ics"], input[placeholder*="http"]');
const fc = await feedInputs.count();
console.log('feed-like inputs:', fc);

// Use the first two visible feed rows
await feedInputs.nth(0).fill(F1);
await feedInputs.nth(1).fill(F2);

// Expand Options on the FIRST row
const opts = page.getByText('Options', { exact: false });
console.log('Options toggles:', await opts.count());
await opts.nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'opts-expanded.png', fullPage: true });

// Find a prefix input within the expanded options
const prefix = page.locator('input[placeholder*="Work"], input[placeholder*="["], input[placeholder*="prefix" i], input[placeholder*="Release"]');
console.log('prefix-like inputs:', await prefix.count());
if (await prefix.count() > 0) {
  await prefix.nth(0).fill('[Release] ');
}
await page.screenshot({ path: 'prefix-set.png', fullPage: true });

// Find create/generate button
const create = page.getByRole('button', { name: /create|generate|blend|make|build feed/i });
console.log('create btns:', await create.count());
const labels = await page.getByRole('button').allTextContents();
console.log('all buttons:', JSON.stringify(labels));

await browser.close();
console.log('ERRORS:', JSON.stringify(errs));
