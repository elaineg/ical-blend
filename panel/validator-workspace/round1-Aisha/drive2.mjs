import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => m.type() === 'error' && errs.push(m.text()));
page.on('pageerror', e => errs.push('PAGEERR ' + e));

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const CA = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const urls = await page.locator('input[type=text]').all();
await urls[0].fill(US);
await urls[1].fill(CA);

// Use summary elements (disclosure) - click by index among all Options summaries
const summaries = page.locator('summary, [role=button]').filter({ hasText: 'Options' });
let sCount = await summaries.count();
console.log('summary Options count:', sCount);
if (sCount >= 2) {
  await summaries.nth(0).click();
  await page.waitForTimeout(200);
  await summaries.nth(1).click();
  await page.waitForTimeout(200);
} else {
  // fallback: click each "Options" text occurrence freshly
  const opts = page.getByText('Options', { exact: true });
  const n = await opts.count();
  for (let k=0;k<n;k++){ await opts.nth(k).click({force:true}); await page.waitForTimeout(150);}
}

await page.getByPlaceholder('[Work]').first().fill('[School] ');

const checks = await page.locator('input[type=checkbox]').all();
console.log('checkbox count:', checks.length);
await checks[2].check();

await page.screenshot({ path: 'probe-out/before-create.png', fullPage: true });

await page.getByRole('button', { name: 'Create feed' }).click();
await page.waitForTimeout(7000);
await page.screenshot({ path: 'probe-out/after-create.png', fullPage: true });

const bodyText = await page.evaluate(() => document.body.innerText);
console.log('=== BODY AFTER CREATE ===');
console.log(bodyText.slice(0, 2500));

const copyBtn = page.getByRole('button', { name: /copy/i });
if (await copyBtn.count()) {
  const labelBefore = await copyBtn.first().innerText();
  await copyBtn.first().click();
  await page.waitForTimeout(600);
  const labelAfter = await copyBtn.first().innerText();
  console.log('COPY label before/after:', JSON.stringify(labelBefore), '/', JSON.stringify(labelAfter));
  let clip = '';
  try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch(e){ clip='READ_BLOCKED'; }
  console.log('CLIPBOARD:', clip.slice(0,120));
  await page.screenshot({ path: 'probe-out/after-copy.png', fullPage: false });
} else {
  console.log('NO COPY BUTTON FOUND');
}

await browser.close();
console.log('ERRORS', JSON.stringify(errs));
