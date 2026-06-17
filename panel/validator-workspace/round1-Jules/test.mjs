import { chromium } from 'playwright';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const CA = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({ permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const log = [];
page.on('console', m => { if (m.type()==='error') log.push('CONSOLE ERR: '+m.text()); });
page.on('pageerror', e => log.push('PAGEERR: '+e.message));

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

// Fill the two feed rows
const inputs = page.locator('input[type="text"], input:not([type])');
const feedInputs = page.locator('input[placeholder*="calendar"], input[placeholder*=".ics"], input[value*="google"]');
// Just grab all text-ish inputs in the feeds section
const allInputs = await page.locator('input').all();
log.push('input count: '+allInputs.length);

// First feed input — clear and type US
const firstFeed = page.locator('input').first();
await firstFeed.fill(US);
// Second feed — placeholder example
const secondFeed = page.getByPlaceholder('https://example.com/calendar-2.ics');
await secondFeed.fill(CA);

// Expand Options on FIRST row, set prefix
const optionsDisclosures = page.getByText('Options', { exact: true });
const optCount = await optionsDisclosures.count();
log.push('Options disclosures found: '+optCount);

await optionsDisclosures.nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'after-expand-opt1.png', fullPage: true });

// Look for prefix input — placeholder likely [Work]
const prefixInput = page.locator('input[placeholder*="["]');
const pc = await prefixInput.count();
log.push('prefix inputs after expand: '+pc);
if (pc>0) await prefixInput.first().fill('[Community] ');

// Expand Options on SECOND row, toggle mask
await optionsDisclosures.nth(1).click();
await page.waitForTimeout(300);

// Find mask-this-feed checkbox (second row's)
const maskFeedCb = page.getByText(/Mask this feed/i);
const mc = await maskFeedCb.count();
log.push('"Mask this feed" labels: '+mc);
if (mc>0) await maskFeedCb.last().click();

const hideAllDay = page.getByText(/Hide all-day/i);
log.push('"Hide all-day" labels: '+(await hideAllDay.count()));

await page.screenshot({ path: 'after-both-options.png', fullPage: true });

// Global include filter
const inc = page.getByPlaceholder('e.g. piano');
if (await inc.count()) await inc.fill('Day');

// Create feed
await page.getByRole('button', { name: /create feed/i }).click();
await page.waitForTimeout(4000);
await page.screenshot({ path: 'after-create.png', fullPage: true });

// Look for result URL / copy button
const bodyText = await page.locator('body').innerText();
log.push('--- has webcal in body: '+ bodyText.includes('webcal'));
log.push('--- has Copy btn: '+ (await page.getByRole('button', { name: /copy/i }).count()));

// Try copy
const copyBtn = page.getByRole('button', { name: /copy/i }).first();
if (await copyBtn.count()) {
  await copyBtn.click();
  await page.waitForTimeout(500);
  const lbl = await copyBtn.innerText();
  log.push('copy btn label after click: '+lbl);
  try { const clip = await page.evaluate(()=>navigator.clipboard.readText()); log.push('clipboard len: '+clip.length+' starts: '+clip.slice(0,40)); } catch(e){ log.push('clipboard read blocked: '+e.message); }
}

// Preview events?
log.push('--- body excerpt (first 600 after create) ---');
log.push(bodyText.slice(0, 1200));

console.log(log.join('\n'));
await browser.close();
