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

// Fill feed 1
const inputs = page.locator('input[type="text"], input[type="url"], input:not([type])');
const feedInputs = page.locator('input[placeholder*="calendar"], input[placeholder*="example"], input[placeholder*=".ics"]');
// grab the source feed inputs by placeholder
const f1 = page.locator('input').filter({ hasNot: page.locator('[placeholder*="piano"]') });
// simpler: target by placeholder example
await page.locator('input[placeholder*="example.com/calendar-2"]').fill(F2);
// first feed input is the one already showing google URL; replace it
const firstFeed = page.locator('input').first();
await firstFeed.fill(F1);

// Find the per-feed Options disclosures
const optionsToggles = page.getByText('Options', { exact: true });
const optCount = await optionsToggles.count();
console.log('Options disclosures found:', optCount);

// Expand options on FEED 1 (first Options) -> set mask
await optionsToggles.nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'opts-expanded.png', fullPage: true });

// dump the expanded options HTML region
const bodyText1 = await page.locator('body').innerText();
console.log('--- after expanding feed1 options (excerpt) ---');
console.log(bodyText1.split('\n').filter(l => /mask|prefix|all-day|hide|busy/i.test(l)).join('\n'));

// Check the per-feed "Mask this feed's titles" on feed 1
const maskCb = page.getByText(/Mask this feed/i).first();
if (await maskCb.count()) {
  // click associated checkbox
  const row = maskCb.locator('xpath=ancestor-or-self::label[1]');
  if (await row.count()) { await row.first().click(); }
  else { await maskCb.click(); }
  console.log('clicked per-feed mask on feed1');
}

// Set prefix on FEED 2: expand its options
await optionsToggles.nth(1).click();
await page.waitForTimeout(300);
// prefix input - find newly visible prefix input
const prefixInputs = page.locator('input[placeholder*="["], input[placeholder*="Work"], input[placeholder*="prefix" i], input[placeholder*="[Work]"]');
console.log('prefix-like inputs:', await prefixInputs.count());
await page.screenshot({ path: 'opts-both.png', fullPage: true });

const allInputs = await page.locator('input').evaluateAll(els =>
  els.map(e => ({ type: e.type, ph: e.placeholder, val: e.value })));
console.log('ALL INPUTS:', JSON.stringify(allInputs, null, 1));

await ctx.close();
await browser.close();
console.log('CONSOLE ERRORS:', errs.length, errs.slice(0,5));
