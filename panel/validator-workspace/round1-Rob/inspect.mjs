import { chromium } from 'playwright';
const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:1280,height:900}, permissions:['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.locator('input').first().fill(F1);
await page.locator('input[placeholder*="example.com/calendar-2"]').fill(F2);

const dumpToggles = async (tag) => {
  const t = await page.locator('summary, button, [role="button"]').evaluateAll(els =>
    els.filter(e=>/options/i.test(e.innerText||'')).map(e=>({tag:e.tagName, txt:(e.innerText||'').trim(), expanded:e.getAttribute('aria-expanded'), open:e.parentElement?.tagName==='DETAILS'?e.parentElement.open:null})));
  console.log(tag, JSON.stringify(t));
};
await dumpToggles('before');
// click first options toggle robustly
const firstOpt = page.locator('summary,button,[role="button"]').filter({ hasText: /^\s*Options\s*$/i }).first();
await firstOpt.click();
await page.waitForTimeout(300);
await dumpToggles('after-expand-1');
// check per-feed mask checkbox by label association
const maskLabel = page.getByText("Mask this feed's titles");
console.log('mask label count', await maskLabel.count());
await maskLabel.click();
await page.waitForTimeout(200);
await dumpToggles('after-mask-click');
await ctx.close(); await browser.close();
