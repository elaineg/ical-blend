import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
// Find all elements whose own text is exactly "Options"
const els = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('*').forEach(e => {
    const t = (e.childNodes.length && [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()) || '';
    if (t === 'Options') out.push({ tag: e.tagName, role: e.getAttribute('role'), cls: e.className?.toString().slice(0,40), aria: e.getAttribute('aria-expanded') });
  });
  return out;
});
console.log(JSON.stringify(els, null, 2));
await browser.close();
