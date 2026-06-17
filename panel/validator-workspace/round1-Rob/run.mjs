import { chromium } from 'playwright';
const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:1280,height:900}, permissions:['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); page.on('pageerror',e=>errs.push('PE:'+e.message));
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.locator('input').first().fill(F1);
await page.locator('input[placeholder*="example.com/calendar-2"]').fill(F2);

const optBtns = page.locator('button', { hasText: 'Options' });
// feed1: expand + per-feed mask
await optBtns.nth(0).click(); await page.waitForTimeout(250);
await page.getByText("Mask this feed's titles").click(); await page.waitForTimeout(150);
// feed2: expand + prefix
await optBtns.nth(1).click(); await page.waitForTimeout(250);
const prefixes = page.locator('input[placeholder="[Work] "]');
console.log('prefix count', await prefixes.count());
await prefixes.nth(1).fill('[CA] ');
await page.screenshot({ path:'before-create.png', fullPage:true });

await page.getByRole('button',{ name:/Create feed/i }).click();
await page.waitForTimeout(3000);
await page.screenshot({ path:'after-create.png', fullPage:true });
const out = await page.locator('body').innerText();
console.log('=== AFTER CREATE ==='); console.log(out.slice(0,2200));

const copyBtn = page.getByRole('button',{ name:/copy/i });
if(await copyBtn.count()){
  const b=await copyBtn.first().innerText();
  await copyBtn.first().click(); await page.waitForTimeout(700);
  const a=await copyBtn.first().innerText();
  let clip=''; try{clip=await page.evaluate(()=>navigator.clipboard.readText());}catch(e){clip='BLOCKED:'+e.message;}
  console.log(`COPY before="${b}" after="${a}" clip="${clip.slice(0,140)}"`);
} else console.log('NO COPY BUTTON');
await page.screenshot({ path:'after-copy.png', fullPage:true });

// fetch the generated feed URL to confirm masking applied on feed1 and prefix on feed2
const feedUrl = await page.evaluate(()=>{
  const a=[...document.querySelectorAll('a,input,code,textarea')].map(e=>e.value||e.textContent||e.href||'').find(t=>/\/feed|\.ics|webcal/i.test(t));
  return a||'';
});
console.log('FEED URL GUESS:', feedUrl.slice(0,200));
console.log('ERRORS', errs.length, errs.slice(0,5));
await ctx.close(); await browser.close();
