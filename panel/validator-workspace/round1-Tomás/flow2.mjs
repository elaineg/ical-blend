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

const ti = await page.locator('input[type="text"]').all();
await ti[0].fill(US);   // feed 0 = US, will MASK (the "sensitive" one)
await ti[1].fill(UK);   // feed 1 = UK, will PREFIX

const optToggles = page.getByText('Options', { exact: true });

// Feed 0: open options, tick "Mask this feed's titles"
await optToggles.nth(0).click();
await page.waitForTimeout(200);
await page.getByText('Mask this feed', { exact: false }).first().click();

// Feed 1: open options, type a prefix label
await optToggles.nth(1).click();
await page.waitForTimeout(200);
// The prefix input has placeholder [Work]; there are now two such inputs - target the 2nd
const prefixInputs = page.getByPlaceholder('[Work]');
console.log('prefix inputs:', await prefixInputs.count());
await prefixInputs.nth(1).fill('[UK] ');

await page.screenshot({ path: 'before-create.png', fullPage: true });

// Create feed
await page.getByRole('button', { name: /create feed/i }).click();

// Wait for result - look for a feed URL / copy button
await page.waitForTimeout(4000);
const bodyText = await page.locator('body').innerText();
console.log('--- after create ---');
console.log(bodyText.slice(0, 1500));

await page.screenshot({ path: 'after-create.png', fullPage: true });
console.log('ERRORS:', JSON.stringify(errs));
await browser.close();
