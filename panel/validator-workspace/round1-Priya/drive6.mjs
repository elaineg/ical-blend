import { chromium } from 'playwright';
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
// Put US in row1 and MASK it; UK in row2 with prefix
await page.locator('input').nth(0).fill(US);
await page.locator('input[placeholder*="calendar-2"]').first().fill(UK);
const spans = page.getByText('Options', { exact: true });
await spans.nth(0).click(); await page.waitForTimeout(200);
await spans.nth(1).click(); await page.waitForTimeout(200);
// mask row1 (US, reliable), prefix row2 (UK)
await page.locator('input[type="checkbox"]').nth(0).check();
await page.getByPlaceholder('[Work]').nth(1).fill('[UK] ');
await page.getByRole('button', { name: /create feed/i }).click();
for (let i=0;i<25;i++){ await page.waitForTimeout(1000); const t=await page.locator('body').innerText(); if(/Preview/i.test(t)&&!/Creating/.test(t)) break; }
await page.screenshot({ path: 'result-masked-us.png', fullPage: true });
const body = await page.locator('body').innerText();
const idx = body.indexOf('Preview');
console.log(body.slice(idx, idx+1500));
console.log('--- summary line ---');
const m = body.match(/Merged[^]*?refreshes\.|Merged[^]*?masked\./);
console.log(m? m[0] : 'n/a');
await browser.close();
