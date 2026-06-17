import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1280,height:900}})).newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';
await page.getByPlaceholder(/googleapis|\.ics/).first().fill(US);
await page.getByPlaceholder(/calendar-2|\.ics/).nth(1).fill(UK);
await page.getByText('Options', { exact: true }).nth(0).click();
await page.waitForTimeout(400);
await page.getByPlaceholder('[Work]').first().fill('[USA] ');
await page.waitForTimeout(300);
// fresh query
const opt = page.getByText('Options', { exact: true });
const n = await opt.count();
console.log('fresh Options count:', n);
for (let i=0;i<n;i++){
  const box = await opt.nth(i).boundingBox().catch(()=>null);
  const vis = await opt.nth(i).isVisible().catch(()=>'err');
  console.log(i, 'visible:', vis, 'box:', box);
}
await browser.close();
