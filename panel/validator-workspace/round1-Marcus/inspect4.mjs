import { chromium } from 'playwright';
const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const allInputs = await page.locator('input[type="text"], input[type="url"]').all();
await allInputs[0].fill(F1);
await allInputs[1].fill(F2);
await page.screenshot({ path: 's0-two-feeds.png', fullPage: true });

await page.getByText('Options', { exact: true }).nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 's1-row1-expanded.png', fullPage: true });

await page.getByPlaceholder('[Work]').first().fill('[US] ');
await page.waitForTimeout(200);
await page.screenshot({ path: 's2-prefix-set.png', fullPage: true });

// count options & rows BEFORE hide-all-day
let n = await page.evaluate(() => [...document.querySelectorAll('span')].filter(s=>s.textContent==='Options').length);
let rows = await page.locator('input[type="text"], input[type="url"]').count();
console.log('BEFORE hide-allday: Options spans=', n, 'text/url inputs=', rows);

await page.getByText(/hide all-day events from this feed/i).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: 's3-hide-allday.png', fullPage: true });

n = await page.evaluate(() => [...document.querySelectorAll('span')].filter(s=>s.textContent==='Options').length);
rows = await page.locator('input[type="text"], input[type="url"]').count();
console.log('AFTER hide-allday: Options spans=', n, 'text/url inputs=', rows);

// also count the URL row inputs by value
const vals = await page.evaluate(() => [...document.querySelectorAll('input[type=text],input[type=url]')].map(i=>i.value.slice(0,50)));
console.log('input values:', JSON.stringify(vals));
await browser.close();
