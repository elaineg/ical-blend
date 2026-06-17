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

// Fill the two feed inputs
const inputs = page.locator('input[placeholder*="calendar"], input[type="url"], input[placeholder*="ics"]');
// More robust: target the feed url inputs by their container. Grab all text/url inputs that look like feed urls.
const feedInputs = page.locator('input').filter({ hasNot: page.locator('[type=checkbox]') });
const allInputs = await page.locator('input').all();
console.log('input count', allInputs.length);
for (const i of allInputs) {
  const ph = await i.getAttribute('placeholder');
  const type = await i.getAttribute('type');
  console.log('INPUT type=', type, 'ph=', ph);
}

// Fill first two url-ish inputs (the feed rows)
const urlInputs = [];
for (const i of allInputs) {
  const type = await i.getAttribute('type');
  const ph = await i.getAttribute('placeholder') || '';
  if (type !== 'checkbox' && (ph.includes('calendar') || ph.includes('ics') || ph.includes('http') || ph === '')) {
    // skip keyword filters which have placeholders e.g. piano / standup
    if (ph.includes('piano') || ph.includes('standup')) continue;
    urlInputs.push(i);
  }
}
console.log('feed url inputs found:', urlInputs.length);
await urlInputs[0].fill(US);
await urlInputs[1].fill(CA);

// Expand Options on row 1, set prefix
const optionsToggles = page.getByText('Options', { exact: true });
const nOpts = await optionsToggles.count();
console.log('Options toggles:', nOpts);
await optionsToggles.nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'probe-out/options-expanded.png', fullPage: false });

await browser.close();
console.log('ERRORS', JSON.stringify(errs));
