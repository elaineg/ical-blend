import { chromium } from 'playwright';
const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:1366,height:900}, permissions:['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); page.on('pageerror',e=>errs.push('PE '+e.message));
await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
const ti = await page.locator('input[type="text"]').all();
await ti[0].fill(US); await ti[1].fill(UK);
const optBtns = page.locator('button',{has:page.locator('span',{hasText:'Options'})});
await optBtns.nth(0).click(); await page.waitForTimeout(200);
await page.locator('label').filter({hasText:'Mask this feed'}).first().locator('input[type=checkbox]').check();
await page.locator('button',{has:page.locator('span',{hasText:'Options'})}).nth(1).click(); await page.waitForTimeout(200);
await page.getByPlaceholder('[Work]').nth(1).fill('[CA] ');
await page.getByRole('button',{name:/create feed/i}).click();

// wait until "Creating…" disappears or up to 45s
await page.waitForFunction(()=>!/Creating/.test(document.body.innerText), null, {timeout:45000}).catch(()=>console.log('still creating after 45s'));
await page.waitForTimeout(1000);
const body = await page.locator('body').innerText();
console.log('=== BODY ==='); console.log(body);
await page.screenshot({path:'result.png', fullPage:true});

// find any feed URL shown
const urlMatch = body.match(/https?:\/\/[^\s]+/g);
console.log('URLS in body:', JSON.stringify(urlMatch));

// copy button
const copyBtn = page.getByRole('button',{name:/copy/i});
console.log('copy buttons:', await copyBtn.count());
let b='',a='',clip='';
if(await copyBtn.count()){ b=(await copyBtn.first().innerText()).trim(); await copyBtn.first().click(); await page.waitForTimeout(700); a=(await copyBtn.first().innerText()).trim(); try{clip=await page.evaluate(()=>navigator.clipboard.readText());}catch(e){clip='BLOCKED:'+e.message;} }
console.log('COPY before=[%s] after=[%s] clip=%s', b,a,clip.slice(0,160));
await page.screenshot({path:'after-copy.png', fullPage:true});
console.log('ERRORS:', JSON.stringify(errs));

// If there's a preview area, fetch the generated feed and check masking
const feedUrl = (urlMatch||[]).find(u=>/api|feed|blend|webcal|merge/i.test(u)) || clip.match(/https?:\/\/[^\s]+/)?.[0];
console.log('FEED URL guess:', feedUrl);
await browser.close();
