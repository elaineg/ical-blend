import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

const opts = page.getByText('Options', { exact: true });
console.log('Options exact count:', await opts.count());
const first = opts.first();
console.log('tagName:', await first.evaluate(el => el.tagName));
console.log('outerHTML:', (await first.evaluate(el => el.outerHTML)).slice(0,200));
console.log('parent tag:', await first.evaluate(el => el.parentElement.tagName));
console.log('role-clickable?', await first.evaluate(el => { let n=el; while(n){ if(n.tagName==='BUTTON'||n.tagName==='SUMMARY'||n.getAttribute('role')==='button') return n.tagName+'/'+n.getAttribute('role'); n=n.parentElement;} return 'none'; }));
await browser.close();
