import { chromium } from 'playwright';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const netLog = [];
page.on('request', r => { const u = r.url(); if (u.startsWith('http://localhost')) netLog.push(`${r.method()} ${u.replace('http://localhost:3000','')}`); });
const consoleErr = [];
page.on('console', m => { if (m.type() === 'error') consoleErr.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

await page.locator('input').nth(0).fill(US);
await page.locator('input[placeholder*="calendar-2"]').first().fill(UK);

// "Options" is likely a <summary>. Click each summary.
const summaries = page.locator('summary');
console.log('summary count:', await summaries.count());
await summaries.nth(0).click();
await page.waitForTimeout(200);
await summaries.nth(1).click();
await page.waitForTimeout(200);

// prefix on row1
await page.getByPlaceholder('[Work]').nth(0).fill('[US] ');

const checkboxes = page.locator('input[type="checkbox"]');
const total = await checkboxes.count();
console.log('total checkboxes:', total);
// row1: mask(0) hide(1); row2: mask(2) hide(3); global(4)
await checkboxes.nth(2).check();

await page.screenshot({ path: 'before-create.png', fullPage: true });

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(3000);
await page.screenshot({ path: 'after-create.png', fullPage: true });

const copyBtn = page.getByRole('button', { name: /copy/i }).first();
let before='', after='';
if (await copyBtn.count()) {
  before = (await copyBtn.innerText()).trim();
  await copyBtn.click();
  await page.waitForTimeout(700);
  after = (await page.getByRole('button', { name: /copy|copied/i }).first().innerText().catch(()=>'')).trim();
}
let clip = '';
try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch(e){ clip = 'READ_BLOCKED:'+e.message; }

const bodyText = await page.locator('body').innerText();
console.log('=== NET ==='); console.log(netLog.join('\n'));
console.log('=== ERRORS ==='); console.log(consoleErr.join('\n')||'none');
console.log('copy before/after:', before, '/', after);
console.log('clip:', clip.slice(0,120));
console.log('=== BODY ==='); console.log(bodyText.slice(0,4500));
await browser.close();
