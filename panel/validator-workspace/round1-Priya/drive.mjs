import { chromium } from 'playwright';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const netLog = [];
page.on('request', r => {
  const u = r.url();
  if (!u.startsWith('http://localhost')) return;
  netLog.push(`${r.method()} ${u}`);
});
const consoleErr = [];
page.on('console', m => { if (m.type() === 'error') consoleErr.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

// Fill the two feed rows
const inputs = page.locator('input[type="text"], input:not([type])');
const feedInputs = page.locator('input[placeholder*="calendar"], input[placeholder*="example"], input[type="url"]');
// Use the two source-feed text inputs (first two text inputs in the source block)
const rows = page.locator('input').filter({ hasNot: page.locator('[type="checkbox"]') });

// Identify feed inputs by placeholder
await page.locator('input[placeholder*="calendar-2"]').first().fill(UK);
// First row already has googleapis placeholder text? It's a placeholder, not value. Fill first text input.
const firstFeed = page.locator('input').nth(0);
await firstFeed.fill(US);

// Expand Options on row 1 (US) -> set prefix
const optionsToggles = page.getByText('Options', { exact: false });
const count = await optionsToggles.count();
console.log('Options toggles found:', count);

// Click first Options
await optionsToggles.nth(0).click();
await page.waitForTimeout(300);

// Screenshot expanded options
await page.screenshot({ path: 'opt-row1-expanded.png', fullPage: true });

// Find prefix input in row 1
const prefixInput = page.locator('input[placeholder*="Work"], input[placeholder*="prefix"], input[placeholder*="[" ]').first();
const prefixCount = await page.locator('input[placeholder*="Work"], input[placeholder*="prefix"]').count();
console.log('prefix-like inputs:', prefixCount);

await browser.close();
