import { chromium } from 'playwright';

const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

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

const allInputs = await page.locator('input[type="text"], input[type="url"]').all();
await allInputs[0].fill(F1);
await allInputs[1].fill(F2);

// Options buttons = buttons whose text CONTAINS "Options"
const optButtons = page.locator('button').filter({ hasText: 'Options' });
console.log('option buttons:', await optButtons.count());

// Row 1
await optButtons.nth(0).click();
await page.waitForTimeout(400);
await page.getByPlaceholder('[Work]').first().fill('[US] ');
await page.getByText(/hide all-day events from this feed/i).first().click();
await page.waitForTimeout(300);

// Row 2 (now re-query; expanded row1 button text changed but filter hasText still matches both)
console.log('option buttons after row1:', await optButtons.count());
await optButtons.nth(1).click();
await page.waitForTimeout(400);
const maskLabels = page.getByText(/mask this feed.?s titles/i);
const mcount = await maskLabels.count();
console.log('mask labels count:', mcount);
await maskLabels.nth(mcount - 1).click();
await page.waitForTimeout(200);

await page.screenshot({ path: 'after-both-options.png', fullPage: true });

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(10000);
await page.screenshot({ path: 'after-create.png', fullPage: true });

const body = await page.locator('body').innerText();
console.log('--- BODY AFTER CREATE (3500) ---');
console.log(body.slice(0, 3500));

const copyBtn = page.getByRole('button', { name: /copy/i }).first();
let copiedCue = false;
if (await copyBtn.count() > 0) {
  await copyBtn.click();
  await page.waitForTimeout(600);
  const label = await copyBtn.innerText().catch(() => '');
  console.log('copy btn label after click:', JSON.stringify(label));
  if (/copied/i.test(label)) copiedCue = true;
  try {
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    console.log('clipboard:', clip.slice(0, 200));
  } catch (e) { console.log('clipboard read blocked:', e.message); }
} else { console.log('NO copy button found'); }
console.log('copied cue fired:', copiedCue);
await page.screenshot({ path: 'after-copy.png', fullPage: true });

console.log('--- CONSOLE ERRORS ---');
console.log(errs.length ? errs.join('\n') : 'none');
await browser.close();
