```json
{"tester":2,"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":9}
```

# Marcus — Frontend engineer, 2yrs (high tech, desktop Chrome + devtools) — ROUND 2

## Round-1 blockers — re-checked first
- **(1) Single-feed silent no-op → FIXED.** Filled only feed #1, hit Create feed: now I get a
  green banner "Built from 1 source — add more anytime. 83 events merged." plus the full feed
  URL block. Explicit, confirmed, no dead button. Exactly what I asked for.
- **(2) Duplicate "Busy" rows from shared dates → FIXED.** Built england-and-wales + scotland
  with busy mask on. Preview now lists each date ONCE (Dec 25 once, Dec 28 once, Jan 1 once) —
  no more adjacent identical rows. Verified at the data layer too (see below).

## Dedup verified by curl (not just the UI)
- Merged feed: `HTTP/2 200`, `content-type: text/calendar`, `content-disposition: inline;
  filename="ical-blend.ics"`, `cache-control: public, s-maxage=300, stale-while-revalidate=600`.
- 114 VEVENTs total. `grep DTSTART | uniq -c` → **every date count is 1**, no dupes. Christmas
  (`1225`) appears exactly once per year despite being in both feeds. No duplicate UIDs.
- Dedup is NOT over-aggressive: Scotland-only events survive — 2nd Jan (`0102`) and St Andrew's
  Day (`1130`) are still present. So it collapses true shared events only. Correct.
- All 114 `SUMMARY:Busy` → mask still working.

## Copy confirmation — works (was reportedly added)
- Clicking Copy puts the full feed URL on the clipboard (verified
  `navigator.clipboard.readText()` returned the https feed URL).
- The "Copied!" confirmation IS shown — it renders as a small inline label by the button ~200ms
  after click and persists ~1.5s. Note: the button's own text stays "Copy" rather than swapping
  to "Copied!", so the confirmation is a sibling element. Minor — I noticed it because I was
  polling; a normal user sees the "Copied!" fine. (Copy verified; behaves correctly in test env.)

## Remaining friction (all minor — none block a Slack-share)
- Confirmation text lives next to the button instead of on it; swapping the button label to
  "Copied!" would be the more conventional, more obviously-tied-to-the-action pattern.
- Token URL is still ~180 chars. The footer "the feed URL itself carries your encrypted
  configuration" now explains it, which preempts the "is this safe?" question — good.
- CSS: clean, consistent spacing, proper focus states, green success banner is a nice touch.
  Nothing janky. Shippable.

## What would make me Slack-share it (8 → 9)
Both round-1 blockers are gone and I confirmed dedup end-to-end, so I'm at 9 — I'd drop this in
team Slack as "no-signup tool to merge your GitHub/Google/meetup ICS into one link, with a
busy-only mask for sharing availability." Holding back the 10: the on-button "Copied!" nit and
I'd want one more real-world run against a live Google private ICS, but nothing here scares me.

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Copy confirmation is a sibling label, not an on-button 'Copied!' state", "Token URL ~180 chars (now explained in footer, so minor)"], "priorConcernsAddressed": "all"}
```
