# Round 3 — Marcus (frontend eng, 2yr, desktop Chrome + devtools)

**(a) Advocacy: 8/10** (round 2 was a hard low — my P0 dedup data-loss blocker is now gone)

**(b) Value clear in <30s? YES.** "Stop checking three calendars" + "Paste 2–5 calendar
links. Get one feed. No account... hand others a version with the private titles hidden."
nails the job in one read. As someone who wants a GitHub sprint ICS + personal GCal + meetup
feed merged and de-noised, I knew this was for me immediately. Per-feed "Hide all-day events
from this feed" is exactly my noisy-holidays kill switch — pleasant surprise.

**(c) Biggest remaining blocker: the event-count is dishonest.** Result banner says
"Merged **88 events** from 2 sources" but the actual subscribable .ics serves **65** VEVENTs
(US 27 + CA 38). For an engineer, a count that doesn't match the artifact is a trust ding —
either show the post-dedup/post-filter number or label the 88 as "raw". Not a dealbreaker,
but it's the thing keeping me off a 9.

## Round-2 → Round-3 re-check (my prior complaints)
- **P0 dedup data-loss (my R2 blocker): FIXED.** Pulled the real /api/feed/<token> .ics via
  curl: 65 events, 65 UIDs, 65 balanced BEGIN/END:VEVENT, valid VCALENDAR, CRLF line endings
  (RFC 5545), all-day items as `DTSTART;VALUE=DATE`. No silent collapse.
- **Mask never overwrites unmasked feed: FIXED.** Masked CA feed = all 38 titles "[CA] Busy",
  zero real CA titles leaked; US feed kept full titles "[US] New Year's Day" etc. Airtight.
- **Prefix spacing: FIXED, verified at the byte level.** `od -c` shows `SUMMARY:[CA] Busy` —
  exactly one 0x20 space between `]` and the title. No double/zero space.
- **Recall + Copy cue (I flagged this): FIXED.** "Your recent blends" shows an editable
  nickname as the prominent label ("Sprint + Personal" persisted across reload, localStorage).
  Copy fires a "Copied! / Copied to clipboard" cue (it's a feedback element, not a label
  swap — caught it sampling the DOM; clipboard write verified, real feed URL landed).
- **Privacy copy: FIXED + honest.** "source URLs are encrypted into the feed link and fetched
  server-side on each refresh — never stored persistently." Tells me the truth about server
  fetch + config-in-link. As the dev who'd ask, I'm satisfied.

## Craft notes
CSS is clean — consistent spacing, tidy Options disclosures, no jank, zero console errors
across the whole flow. "Add to Google Calendar" + webcal link are nice touches. This is
genuinely close to something I'd drop in team Slack. Fix the count mismatch and it's a 9.

```json
{"tester": 1, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Result banner says 88 events but feed serves 65 — count doesn't match artifact", "Copied cue is a separate element, not a button-label swap (works, just less obvious)"], "priorConcernsAddressed": "all"}
```
