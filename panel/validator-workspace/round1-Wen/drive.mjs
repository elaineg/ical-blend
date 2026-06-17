import { chromium } from 'playwright';
import fs from 'fs';

const US = 'https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics';
const UK = 'https://www.calendarlabs.com/ical-calendar/ics/39/Canada_Holidays.ics';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
const page = await ctx.newPage();
const log = (...a) => console.log(...a);

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.getByPlaceholder(/googleapis|\.ics/).first().fill(US);
await page.getByPlaceholder(/calendar-2|\.ics/).nth(1).fill(UK);

// Expand feed1 (first Options toggle) and set prefix
await page.getByText(/^Options/).nth(0).click();
await page.waitForTimeout(400);
await page.getByPlaceholder('[Work]').first().fill('[USA] ');
log('prefix set on feed1; feed1 toggle now shows active state');

// Expand feed2 (now the toggle reading exactly "Options" with no ·on)
await page.getByText(/^Options/).last().click();
await page.waitForTimeout(500);

// Mask feed2: there are 2 "Mask this feed's titles" labels now. nth(1) = feed2
const maskLabels = page.getByText("Mask this feed's titles");
log('mask labels:', await maskLabels.count());
await maskLabels.nth(1).click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'both-configured.png', fullPage: true });

await page.getByRole('button', { name: /Create feed/i }).click();
await page.waitForTimeout(9000);
await page.screenshot({ path: 'after-create.png', fullPage: true });

const bodyText = await page.locator('body').innerText();
log('--- BODY AFTER CREATE ---');
log(bodyText.slice(0, 2400));

const ro = page.locator('input[readonly], textarea[readonly]');
let feedUrl = '';
if (await ro.count()) { feedUrl = await ro.first().inputValue(); log('FEED URL:', feedUrl); }

const copyBtn = page.getByRole('button', { name: /^Copy/i });
if (await copyBtn.count()) {
  await copyBtn.first().click();
  await page.waitForTimeout(700);
  log('copy label after click:', await copyBtn.first().innerText().catch(()=>''));
  try { log('CLIPBOARD:', (await page.evaluate(() => navigator.clipboard.readText())).slice(0,140)); }
  catch(e){ log('clipboard err:', e.message); }
}

if (feedUrl) {
  const resp = await page.request.get(feedUrl);
  const ics = await resp.text();
  fs.writeFileSync('merged.ics', ics);
  const summaries = [...ics.matchAll(/SUMMARY[^:]*:(.*)/g)].map(m=>m[1].trim());
  log('MERGED HTTP', resp.status());
  log('TOTAL VEVENTs:', (ics.match(/BEGIN:VEVENT/g)||[]).length);
  log('SUMMARY count:', summaries.length);
  log('USA-prefixed:', summaries.filter(s=>s.startsWith('[USA]')).length);
  log('Busy:', summaries.filter(s=>/^Busy$/i.test(s)).length);
  log('non-USA non-Busy sample (should be UK before masking? or feed2 masked):', summaries.filter(s=>!s.startsWith('[USA]')&&!/^Busy$/i.test(s)).slice(0,10));
  log('USA sample:', summaries.filter(s=>s.startsWith('[USA]')).slice(0,6));
}

// Also fetch each source raw to compare event counts (fidelity check)
const usResp = await page.request.get(US);
const ukResp = await page.request.get(UK);
const usIcs = await usResp.text(); const ukIcs = await ukResp.text();
log('RAW US VEVENTs:', (usIcs.match(/BEGIN:VEVENT/g)||[]).length);
log('RAW UK VEVENTs:', (ukIcs.match(/BEGIN:VEVENT/g)||[]).length);

await browser.close();
log('DONE');
