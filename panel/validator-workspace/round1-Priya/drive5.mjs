import { chromium } from 'playwright';
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const netLog = [];
page.on('response', r => { const u=r.url(); if(u.includes('/api/')) netLog.push(`${r.status()} ${r.request().method()} ${u.replace('http://localhost:3000','')}`); });
const consoleErr=[]; page.on('console', m=>{ if(m.type()==='error') consoleErr.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.locator('input').nth(0).fill(US);
await page.locator('input[placeholder*="calendar-2"]').first().fill(UK);
const spans = page.getByText('Options', { exact: true });
await spans.nth(0).click(); await page.waitForTimeout(200);
await spans.nth(1).click(); await page.waitForTimeout(200);
await page.getByPlaceholder('[Work]').nth(0).fill('[US] ');
await page.locator('input[type="checkbox"]').nth(2).check();
await page.getByRole('button', { name: /create feed/i }).click();

// Wait for either a result URL field or up to 30s
let done=false;
for (let i=0;i<30;i++){
  await page.waitForTimeout(1000);
  const txt = await page.locator('body').innerText();
  if (/webcal|\/api\/feed|Copy feed|Subscribe|preview/i.test(txt) && !/Creating/.test(txt)) { done=true; break; }
}
await page.screenshot({ path: 'result.png', fullPage: true });

const copyBtn = page.getByRole('button', { name: /copy/i }).first();
let before='', after='';
if (await copyBtn.count()) {
  before=(await copyBtn.innerText()).trim();
  await copyBtn.click(); await page.waitForTimeout(700);
  after=(await page.getByRole('button',{name:/copy|copied/i}).first().innerText().catch(()=>'')).trim();
}
let clip=''; try{ clip=await page.evaluate(()=>navigator.clipboard.readText()); }catch(e){ clip='READ_BLOCKED'; }

const bodyText = await page.locator('body').innerText();
console.log('done:', done);
console.log('=== API ==='); console.log(netLog.join('\n'));
console.log('=== ERRORS ==='); console.log(consoleErr.join('\n')||'none');
console.log('copy before/after:', before,'/',after);
console.log('clip:', clip.slice(0,160));
console.log('=== BODY ==='); console.log(bodyText.slice(0,5000));
await browser.close();
