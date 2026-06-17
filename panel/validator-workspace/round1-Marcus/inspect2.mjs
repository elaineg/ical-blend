import { chromium } from 'playwright';
const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const allInputs = await page.locator('input[type="text"], input[type="url"]').all();
await allInputs[0].fill(F1);

// expand row 0
await page.getByText('Options', { exact: true }).nth(0).click({ force: true });
await page.waitForTimeout(400);

const opts = page.getByText('Options', { exact: true });
console.log('count after expand0:', await opts.count());
for (let i = 0; i < await opts.count(); i++) {
  const el = opts.nth(i);
  const info = await el.evaluate(n => {
    const r = n.getBoundingClientRect();
    return { html: n.outerHTML.slice(0,80), visible: r.width>0&&r.height>0, top: r.top, parentTag: n.parentElement?.tagName, parentClass: n.parentElement?.className?.slice(0,60) };
  });
  console.log(i, JSON.stringify(info));
}
await browser.close();
