# Round 5 — Marcus (frontend eng, 2yr, desktop/Chrome devtools)

**Round4 → Round5 movement: 8 → 9 (+1).**

## Re-check of the ONLY change (copy-only hero reorder)
New H1: "One feed from all your calendars — work, personal, or team". Lead now gives
personal/family equal billing with work/team ("merging work, personal, and family
calendars, or combining client projects, webinar schedules, and launch timelines"). It
reads cleanly, no widow/wrap jank at 1280px, and it lands faster for me than the old
work-first framing — I instantly saw the GitHub-feed-+-personal-Google-Cal use case is
in scope. Good copy edit; it does what it claims.

## Fresh full-flow retest (US + Canada holiday feeds, real)
Drove it end to end in Playwright. Set `[US] ` / `[CA] ` per-feed prefixes, masked the CA
feed only via its per-feed Options, hit Create feed. Then I fetched the actual served ICS:
- 65 VEVENTs = 27 `[US]` (real titles) + 38 `[CA] Busy`. Zero CA title leaks.
- UI says "65 events from 2 sources... 2 feeds labelled. 1 feed masked." — matches the
  bytes exactly. The count-honesty fix I accepted in R4 still holds.
- 0 console errors, 0 page errors. Feed URL + webcal:// + Add-to-Google all present.
- Bonus I hadn't fully clocked before: per-feed "Hide all-day events from this feed" —
  that is LITERALLY my "drop noisy all-day events" requirement, per source. That's the
  thing that tips me from 8 to 9.

## Answers
**(a) Advocacy: 9/10** — I'd drop this in team Slack unprompted. It nails my exact stack
need (merge GitHub ICS + personal Google Cal + meetup feed, prefix each, drop all-day
noise) with no signup and an honest preview a skeptic engineer can verify.

**(b) Value clear in <30s? YES.** New H1 + lead make the job and audience obvious cold.

**(c) Biggest remaining item — SOFT PREFERENCE, not a defect.** The all-day-drop control
lives one click deep inside each feed's Options; nothing on the hero advertises it, so a
scanner might not realize the noise-filtering exists. Everything works; this is discovery
polish, not breakage. Not gating.

Why 9 and not 10: I want the noise-filter visible without expanding Options, and the
"URLs transit the server" disclosure (honest, appreciated) means I'd hesitate before
pasting a private auth'd Google secret-cal URL — fine for holiday/GitHub feeds, a small
mental footnote for truly private ones.

```json
{"tester": 4, "round": 5, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["all-day-drop filter is buried one click into per-feed Options; not surfaced on hero", "server-transit of source URLs gives slight pause for truly-private auth'd cal links"], "priorConcernsAddressed": "all"}
```
