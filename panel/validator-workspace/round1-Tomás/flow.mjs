import { chromium } from 'playwright';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERR ' + e.message));

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

// Fill first feed (clear existing prefill)
const inputs = page.locator('input[type="text"], input:not([type])');
const feed0 = page.locator('input').filter({ hasNot: page.locator('[type=checkbox]') }).first();
// just grab url-ish inputs
const urlInputs = page.getByPlaceholder(/calendar|ics|http/i);
console.log('url input count:', await urlInputs.count());

// Use first two source feed inputs
const allTextInputs = await page.locator('input[type="text"]').all();
console.log('text inputs total:', allTextInputs.length);

// Feed 0
await allTextInputs[0].fill(US);
await allTextInputs[1].fill(UK);

// Expand BOTH Options disclosures
const optToggles = page.getByText('Options', { exact: true });
const nOpts = await optToggles.count();
console.log('Options toggles found:', nOpts);

// Expand feed 0 options
await optToggles.nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'opts-feed0-open.png' });

// Look at what controls appear
const bodyText = await page.locator('body').innerText();
console.log('--- after opening feed0 options, mask-related text present? ---');
console.log('has "Mask this feed":', /mask this feed/i.test(bodyText));
console.log('has "Prefix"/"prefix":', /prefix/i.test(bodyText));
console.log('has "Hide all-day":', /hide all-day/i.test(bodyText));

await browser.close();
console.log('ERRORS:', JSON.stringify(errs));
