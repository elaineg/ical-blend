import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1280,height:900}})).newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
await page.getByPlaceholder(/googleapis|\.ics/).first().fill(US);
await page.getByText('Options', { exact: true }).nth(0).click();
await page.waitForTimeout(400);
const opts = page.getByText('Options', { exact: true });
console.log('Options exact count after expand feed1:', await opts.count());
// What summary/disclosure elements exist?
const summaries = await page.locator('summary').allInnerTexts().catch(()=>[]);
console.log('summary els:', summaries);
const detailsOpen = await page.locator('details[open]').count();
console.log('details[open]:', detailsOpen, 'details total:', await page.locator('details').count());
await browser.close();
