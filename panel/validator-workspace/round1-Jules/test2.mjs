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

// Use <summary> / disclosure elements directly
const summaries = page.locator('summary');
log.push('summary elements: '+(await summaries.count()));

// Expand row1 Options, set prefix
await summaries.nth(0).click();
await page.waitForTimeout(200);
await page.getByPlaceholder('[Work]').first().fill('[Community] ');

// Expand row2 Options, toggle mask
await summaries.nth(1).click();
await page.waitForTimeout(200);
// second row's mask checkbox: there are two "Mask this feed's titles" now
const maskCbs = page.locator('input[type="checkbox"]');
log.push('checkboxes total: '+(await maskCbs.count()));
// click the mask checkbox in row 2 — find by associated text
await page.getByText("Mask this feed's titles").nth(1).click();
await page.waitForTimeout(200);
await page.screenshot({ path: 'after-both-options2.png', fullPage: true });

// Global include filter — interaction test
await page.getByPlaceholder('e.g. piano').fill('Day');

await page.getByRole('button', { name: /create feed/i }).click();
// wait for result
await page.waitForTimeout(6000);
await page.screenshot({ path: 'after-create2.png', fullPage: true });
const bodyText = await page.locator('body').innerText();
log.push('has webcal: '+bodyText.includes('webcal'));
log.push('has https feed result: '+/feed|\.ics|webcal/i.test(bodyText));

const copyBtn = page.getByRole('button', { name: /copy/i }).first();
log.push('copy buttons: '+(await page.getByRole('button',{name:/copy/i}).count()));
if (await copyBtn.count()) {
  const before = await copyBtn.innerText();
  await copyBtn.click();
  await page.waitForTimeout(600);
  const after = await copyBtn.innerText();
  log.push('copy label before/after: ['+before+'] -> ['+after+']');
  try { const c = await page.evaluate(()=>navigator.clipboard.readText()); log.push('clipboard: '+c.slice(0,60)); } catch(e){ log.push('clipboard blocked: '+e.message); }
}
log.push('=== BODY AFTER CREATE ===');
log.push(bodyText.slice(0,1800));
console.log(log.join('\n'));
await browser.close();
