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
await ti[0].fill(US);
await ti[1].fill(UK);

const optBtns = page.locator('button', { has: page.locator('span', { hasText: 'Options' }) });
console.log('option buttons:', await optBtns.count());

// Open feed 0
await optBtns.nth(0).click();
await page.waitForTimeout(250);

// Mask checkbox: there should now be exactly 1 "Mask this feed" checkbox visible (feed0)
const maskRow = page.locator('label').filter({ hasText: 'Mask this feed' });
console.log('mask labels:', await maskRow.count());
await maskRow.first().locator('input[type=checkbox]').check();
console.log('mask checked:', await maskRow.first().locator('input[type=checkbox]').isChecked());

// Open feed 1 (re-query buttons fresh)
const optBtns2 = page.locator('button', { has: page.locator('span', { hasText: 'Options' }) });
console.log('option buttons now:', await optBtns2.count());
await optBtns2.nth(1).click();
await page.waitForTimeout(250);

const prefixInputs = page.getByPlaceholder('[Work]');
console.log('prefix inputs:', await prefixInputs.count());
await prefixInputs.nth(1).fill('[UK] ');

await page.screenshot({ path: 'before-create.png', fullPage: true });

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(5000);

const bodyText = await page.locator('body').innerText();
console.log('=== BODY AFTER CREATE ===');
console.log(bodyText);
await page.screenshot({ path: 'after-create.png', fullPage: true });

const copyBtn = page.getByRole('button', { name: /^copy/i });
let b='',a='',clip='';
if (await copyBtn.count()) {
  b = (await copyBtn.first().innerText()).trim();
  await copyBtn.first().click();
  await page.waitForTimeout(700);
  a = (await copyBtn.first().innerText()).trim();
  try { clip = await page.evaluate(()=>navigator.clipboard.readText()); } catch(e){ clip='BLOCKED:'+e.message; }
}
console.log('COPY before=[%s] after=[%s] clip=%s', b, a, clip.slice(0,140));
await page.screenshot({ path: 'after-copy.png', fullPage: true });
console.log('ERRORS:', JSON.stringify(errs));
await browser.close();
