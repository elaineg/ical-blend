import { chromium } from 'playwright';

const F1 = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const F2 = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const log = (...a) => console.log(...a);
page.on('console', m => { if (m.type() === 'error') log('CONSOLE-ERR:', m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

// How many Options disclosures visible on cold load?
const optCount = await page.getByText('Options', { exact: true }).count();
log('Options disclosures visible cold:', optCount);

// Fill the two feed rows (overwrite prefilled / example)
const inputs = page.locator('input[type="url"], input[placeholder*="calendar"], input[placeholder*="ics"], input[type="text"]');
// Better: target the source feed inputs specifically
const feedInputs = page.locator('input').filter({ hasNot: page.locator('[type="checkbox"]') });
const n = await feedInputs.count();
log('total inputs on page:', n);

// Fill first two URL-looking inputs
const urlInputs = page.locator('input[placeholder*="calendar"], input[placeholder*="example"], input[placeholder*=".ics"]');
log('url-ish inputs:', await urlInputs.count());

await urlInputs.nth(0).fill(F1);
await urlInputs.nth(1).fill(F2);
log('filled both feeds');

// Expand Options on first row
const t0 = Date.now();
await page.getByText('Options', { exact: true }).first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'options-expanded.png' });

// Find prefix input - look for a text input near "[Work]" placeholder or labeled prefix
const prefixInput = page.locator('input[placeholder*="["], input[placeholder*="Work"], input[placeholder*="prefix" i]');
log('prefix-candidate inputs:', await prefixInput.count());
if (await prefixInput.count() > 0) {
  await prefixInput.first().fill('[OnCall] ');
  log('set prefix [OnCall]');
} else {
  log('NO obvious prefix input found after expanding Options');
}
await page.screenshot({ path: 'prefix-set.png' });

// Create feed
await page.getByRole('button', { name: /create feed/i }).click();
log('clicked Create feed');
await page.waitForTimeout(4000);
await page.screenshot({ path: 'after-create.png', fullPage: true });

// Time to first merged feed
log('elapsed since options-click ms:', Date.now() - t0);

// Look for the generated feed URL + Copy button
const bodyText = await page.locator('body').innerText();
log('--- body after create (first 1200) ---');
log(bodyText.slice(0, 1200));

// Try copy button
const copyBtn = page.getByRole('button', { name: /copy/i });
if (await copyBtn.count() > 0) {
  await copyBtn.first().click();
  await page.waitForTimeout(600);
  const label = await copyBtn.first().innerText();
  log('copy button label after click:', JSON.stringify(label));
  try {
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    log('clipboard content:', clip.slice(0, 120));
  } catch (e) {
    log('clipboard read blocked (env):', e.message);
  }
} else {
  log('NO copy button found');
}

await browser.close();
