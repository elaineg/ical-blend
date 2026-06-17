import { chromium } from 'playwright';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const netLog = [];
page.on('request', r => { const u = r.url(); if (u.startsWith('http://localhost')) netLog.push(`${r.method()} ${u.replace('http://localhost:3000','')}`); });
const consoleErr = [];
page.on('console', m => { if (m.type() === 'error') consoleErr.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

await page.locator('input').nth(0).fill(US);
await page.locator('input[placeholder*="calendar-2"]').first().fill(UK);

const optionsToggles = page.getByText('Options', { exact: true });
// Row1 options
await optionsToggles.nth(0).click();
await page.waitForTimeout(200);
await page.getByPlaceholder('[Work]').fill('[US] ');

// Row2 options -> mask
await optionsToggles.nth(1).click();
await page.waitForTimeout(200);
// Two "Mask this feed's titles" checkboxes now exist; pick the 2nd
const maskBoxes = page.getByText("Mask this feed's titles");
console.log('mask checkboxes labels:', await maskBoxes.count());
// click the checkbox in row2 — find checkbox preceding the 2nd mask label
const row2Mask = page.locator('label, div').filter({ hasText: "Mask this feed's titles" });
// directly toggle the checkbox nearest the 2nd mask label
const checkboxes = page.locator('input[type="checkbox"]');
console.log('total checkboxes:', await checkboxes.count());
// row1 mask = checkbox idx0, row1 hide = idx1, row2 mask = idx2, row2 hide = idx3, global = last
const total = await checkboxes.count();
await checkboxes.nth(2).check();

await page.screenshot({ path: 'before-create.png', fullPage: true });

await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: 'after-create.png', fullPage: true });

// Try the copy button
const copyBtn = page.getByRole('button', { name: /copy/i }).first();
let copyLabelBefore = '';
if (await copyBtn.count()) {
  copyLabelBefore = (await copyBtn.innerText()).trim();
  await copyBtn.click();
  await page.waitForTimeout(600);
}
const copyLabelAfter = (await page.getByRole('button', { name: /copy|copied/i }).first().innerText().catch(()=> '')).trim();

// grab body text for preview inspection
const bodyText = await page.locator('body').innerText();

console.log('=== NET (localhost) ===');
console.log(netLog.join('\n'));
console.log('=== CONSOLE ERRORS ===');
console.log(consoleErr.join('\n') || 'none');
console.log('copy before/after:', copyLabelBefore, '/', copyLabelAfter);
console.log('=== BODY (preview area) ===');
console.log(bodyText.slice(0, 4000));

await browser.close();
