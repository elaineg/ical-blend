import { chromium } from 'playwright';
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const CA = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';
const browser = await chromium.launch();
const ctx = await browser.newContext({ permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const log = [];
page.on('console', m => { if (m.type()==='error') log.push('CONSOLE ERR: '+m.text()); });
page.on('pageerror', e => log.push('PAGEERR: '+e.message));
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.locator('input').first().fill(US);
await page.getByPlaceholder('https://example.com/calendar-2.ics').fill(CA);

const optEls = page.getByText('Options', { exact: true });
log.push('Options count: '+(await optEls.count()));
// tagName of each
for (let i=0;i<await optEls.count();i++){
  const tag = await optEls.nth(i).evaluate(e=>e.tagName+' role='+(e.getAttribute('role')||'')+' aria-expanded='+(e.getAttribute('aria-expanded')||''));
  log.push('opt['+i+'] '+tag);
}
// expand row1
await optEls.nth(0).click();
await page.waitForTimeout(300);
log.push('after expand1, Options count: '+(await optEls.count()));
await page.getByPlaceholder('[Work]').first().fill('[Community] ');
// re-query and expand row2
const optEls2 = page.getByText('Options', { exact: true });
log.push('Options count re-query: '+(await optEls2.count()));
// click LAST one (row2)
await optEls2.last().click();
await page.waitForTimeout(300);
const maskLabels = page.getByText("Mask this feed's titles");
log.push('mask labels: '+(await maskLabels.count()));
await maskLabels.last().click();
await page.waitForTimeout(200);
await page.screenshot({ path: 'opts-done.png', fullPage: true });
await page.getByPlaceholder('e.g. piano').fill('Day');
await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(7000);
await page.screenshot({ path: 'created.png', fullPage: true });
const bodyText = await page.locator('body').innerText();
log.push('has webcal: '+bodyText.includes('webcal')+' / has /api or feed url: '+/https?:\/\/[^ ]*(feed|\.ics|blend|api)/i.test(bodyText));
const copyBtn = page.getByRole('button', { name: /copy/i }).first();
log.push('copy buttons: '+(await page.getByRole('button',{name:/copy/i}).count()));
if (await copyBtn.count()) {
  const before = await copyBtn.innerText();
  await copyBtn.click();
  await page.waitForTimeout(600);
  log.push('copy label: ['+before+'] -> ['+(await copyBtn.innerText())+']');
  try { const c = await page.evaluate(()=>navigator.clipboard.readText()); log.push('clipboard: '+c.slice(0,70)); } catch(e){ log.push('clipboard blocked: '+e.message); }
}
log.push('=== BODY ===');
log.push(bodyText.slice(0,2000));
console.log(log.join('\n'));
await browser.close();
