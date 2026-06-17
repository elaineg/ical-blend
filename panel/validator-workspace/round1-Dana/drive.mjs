import { chromium } from 'playwright';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const CA = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

// Fill the two feed inputs
const inputs = page.locator('input[type="text"], input:not([type])');
const feedInputs = page.locator('input').filter({ hasNot: page.locator('[type=checkbox]') });
// grab the URL text inputs (first two visible text inputs in source feeds)
const urlInputs = await page.locator('input[type="text"]').all();
console.log('text inputs found:', urlInputs.length);

// Use placeholders/order: first feed row input, second feed row input
const allInputs = await page.locator('input').all();
let textBoxes = [];
for (const i of allInputs) {
  const t = await i.getAttribute('type');
  if (t === 'text' || t === null || t === 'url') textBoxes.push(i);
}
console.log('candidate boxes:', textBoxes.length);

await textBoxes[0].fill(US);
await textBoxes[1].fill(CA);

// Find the "Options" disclosure on the FIRST feed row and click it
const optionsToggles = page.getByText('Options', { exact: true });
const optCount = await optionsToggles.count();
console.log('Options toggles:', optCount);
await optionsToggles.first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'after-options.png', fullPage: true });

// Now find the prefix input inside expanded options
// Look for an input with placeholder containing [ or "prefix"
const afterInputs = await page.locator('input').all();
let prefixInput = null;
for (const i of afterInputs) {
  const ph = (await i.getAttribute('placeholder')) || '';
  if (/\[|prefix/i.test(ph)) { prefixInput = i; console.log('prefix placeholder:', ph); break; }
}
if (prefixInput) {
  await prefixInput.fill('[Webinars] ');
} else {
  console.log('NO prefix input found by placeholder');
}
await page.screenshot({ path: 'prefix-set.png', fullPage: true });

// Click Create feed
await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(3000);
await page.screenshot({ path: 'created.png', fullPage: true });

// Try the copy button
const copyBtn = page.getByRole('button', { name: /copy/i });
let copyLabelBefore = '';
if (await copyBtn.count()) {
  copyLabelBefore = await copyBtn.first().innerText();
  await copyBtn.first().click();
  await page.waitForTimeout(600);
  const copyLabelAfter = await copyBtn.first().innerText();
  console.log('copy before/after:', JSON.stringify(copyLabelBefore), '/', JSON.stringify(copyLabelAfter));
  try {
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    console.log('clipboard:', clip.slice(0, 120));
  } catch (e) { console.log('clipboard read blocked:', e.message); }
} else {
  console.log('NO copy button');
}

// Capture preview text
const bodyText = await page.locator('body').innerText();
console.log('---PAGE TEXT (first 1500)---');
console.log(bodyText.slice(0, 1500));
console.log('---CONSOLE ERRORS---', JSON.stringify(errs));
await browser.close();
