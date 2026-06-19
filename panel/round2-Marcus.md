# Marcus — Round 2 (frontend eng, 2yr, Chrome + devtools)

Feature focus: "Preview & test your feeds" before subscribing. Driven cold over Playwright.

## Re-checking my Round 1 complaints
1. **Missing space "kept 375after filters & mask" — FIXED.** Now renders "Fetched 408 events
   → kept 408 after filters & mask" with a proper space (confirmed in innerText AND a 2x crop).
   With an exclude filter it correctly shows "Fetched 408 events → kept 375 after filters &
   mask" — excluding "bank holiday" drops 33, math reconciles. The string jank is gone.
2. **"Load a sample feed" didn't auto-run the merge — FIXED.** One click now populates the
   fields AND runs the preview: STATUS panel, reconciliation line, and PREVIEW · NEXT 15 all
   appear with no second button press. That dangling click is gone.

priorConcernsAddressed: all

## Fresh walkthrough
- Cold load, 1280px Chrome: headline + "Paste 2–5 calendar links. Preview & test them, then
  get one feed. No account." — job clear in ~5s.
- One-click sample: ✓ [Holidays] — 83 events fetched / ✓ [Personal] — 325 events fetched,
  reconciliation, then a chronological NEXT 15 with consistent [Source] tags. Labels are
  normalized (bracketed, green check, em-dash with a real `ml-1` gap, count) — clean at 2x.
- Failure honesty: dead domain in source 1 + real gov.uk in source 2 → "✗ …example — fetch
  failed", "✓ www.gov.uk — 83 events fetched", "Fetched 83 → kept 83", "1 source failed — its
  events are not included." It even injects a "iCal Blend: 1 source failed" VEVENT INTO the
  merged preview so a subscriber sees the breakage in their calendar. That's the screenshot
  I'd post in Slack.
- Source-status spacing I worried about in innerText ("[Personal]— 325") is real CSS margin
  (`ml-1`), not a missing space — renders correctly.
- 0 console errors, 0 page errors across sample / failure / filter flows. No layout jank.

## Answers
1. **Gut reaction / share in Slack?** Yes. Both my R1 nits are gone and the polish now matches
   the pitch. Exactly my use case — GitHub sprint ICS + personal Google Cal + a meetup feed,
   exclude-filter the noise, one webcal link, no signup. I'd drop it in team Slack today.
2. **Top blocker:** None blocking. Only thing off a perfect 10: my literal motivation (drop
   noisy all-day events) still goes through a keyword exclude rather than a one-click "drop
   all-day events" toggle in the global panel. Minor — the per-feed options cover it.
3. **Clarity 10 / Value 10 / Advocacy 9.**

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["No one-click 'drop all-day events' toggle in the global panel — must use a keyword exclude for the all-day noise that is my core motivation"], "priorConcernsAddressed": "all"}
```

Marcus — adv:9 clarity:10 value:10 — top blocker: none; both R1 nits (missing-space recon + non-auto sample preview) fixed, only gap is no dedicated drop-all-day-events toggle.
