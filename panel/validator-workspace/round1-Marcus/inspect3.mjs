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

await page.getByText('Options', { exact: true }).nth(0).click();
await page.waitForTimeout(400);
await page.getByPlaceholder('[Work]').first().fill('[US] ');
await page.getByText(/hide all-day events from this feed/i).first().click();
await page.waitForTimeout(400);

// raw DOM scan
const data = await page.evaluate(() => {
  const spans = [...document.querySelectorAll('span')].filter(s => s.textContent === 'Options');
  return spans.map(s => {
    const btn = s.closest('button');
    const r = (btn||s).getBoundingClientRect();
    const cs = btn ? getComputedStyle(btn) : {};
    return { hasBtn: !!btn, top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width),
      pointer: cs.pointerEvents, disp: cs.display, vis: cs.visibility, disabled: btn?.disabled };
  });
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
