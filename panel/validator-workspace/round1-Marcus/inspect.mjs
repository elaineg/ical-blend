import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

const opts = page.getByText('Options', { exact: true });
console.log('exact Options count:', await opts.count());
for (let i = 0; i < await opts.count(); i++) {
  const el = opts.nth(i);
  const tag = await el.evaluate(n => n.tagName + ' | ' + (n.outerHTML.slice(0,120)));
  console.log(i, tag);
}

// summary elements?
const summaries = page.locator('summary');
console.log('summary count:', await summaries.count());
for (let i = 0; i < await summaries.count(); i++) {
  console.log('summary', i, await summaries.nth(i).innerText());
}
await browser.close();
