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

// disclosures are likely <summary> inside <details>
const summaries = page.locator('summary');
console.log('summary count:', await summaries.count());

// Open feed 0
await summaries.nth(0).click();
await page.waitForTimeout(200);
// Mask checkbox inside feed0 - it's a checkbox; find by associated label text scope
const maskCb = page.locator('label', { hasText: 'Mask this feed' }).first().locator('input[type=checkbox]');
const maskCount = await maskCb.count();
console.log('mask checkbox via label:', maskCount);
if (maskCount) { await maskCb.check(); }
else {
  // fallback: click the text
  await page.getByText("Mask this feed's titles").first().click();
}

// Open feed 1
await summaries.nth(1).click();
await page.waitForTimeout(200);
const prefixInputs = page.getByPlaceholder('[Work]');
console.log('prefix inputs:', await prefixInputs.count());
await prefixInputs.nth(1).fill('[UK] ');

await page.screenshot({ path: 'before-create.png', fullPage: true });

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(4500);

const bodyText = await page.locator('body').innerText();
console.log('--- BODY AFTER CREATE ---');
console.log(bodyText);

await page.screenshot({ path: 'after-create.png', fullPage: true });

// Try the copy button
const copyBtn = page.getByRole('button', { name: /copy/i });
let copyLabelBefore = '', copyLabelAfter = '', clip = '';
if (await copyBtn.count()) {
  copyLabelBefore = (await copyBtn.first().innerText()).trim();
  await copyBtn.first().click();
  await page.waitForTimeout(600);
  copyLabelAfter = (await copyBtn.first().innerText()).trim();
  try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch(e){ clip = 'CLIP_BLOCKED:'+e.message; }
}
console.log('COPY before:', copyLabelBefore, '| after:', copyLabelAfter, '| clip:', clip.slice(0,120));

await page.screenshot({ path: 'after-copy.png', fullPage: true });
console.log('ERRORS:', JSON.stringify(errs));
await browser.close();
