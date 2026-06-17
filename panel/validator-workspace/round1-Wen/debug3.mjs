import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1280,height:900}})).newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';
await page.getByPlaceholder(/googleapis|\.ics/).first().fill(US);
await page.getByPlaceholder(/calendar-2|\.ics/).nth(1).fill(UK);
console.log('before any expand, Options count:', await page.getByText('Options',{exact:true}).count());
await page.getByText('Options', { exact: true }).nth(0).click();
await page.waitForTimeout(400);
console.log('after expand feed1 (before prefix), Options count:', await page.getByText('Options',{exact:true}).count());
await page.screenshot({path:'after-expand-feed1.png', fullPage:true});
// now type prefix
await page.getByPlaceholder('[Work]').first().fill('[USA] ');
await page.waitForTimeout(400);
console.log('after typing prefix, Options count:', await page.getByText('Options',{exact:true}).count());
await page.screenshot({path:'after-prefix.png', fullPage:true});
await browser.close();
