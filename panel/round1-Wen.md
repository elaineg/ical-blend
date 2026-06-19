# Round 1 — Wen (Marketing data analyst, BigQuery/Sheets/Looker/dbt/GA4)

Cold-used at 1440px desktop. Motivation: merge a campaign-launch feed + a dbt/pipeline-run
feed + personal into ONE subscribable feed, but I distrust invisible transforms — so I
checked whether every event survives and whether filtering is auditable.

## (a) Advocacy: 9/10
I would bring this up unprompted in my team Slack. It does the thing I'd otherwise pay
Calendar.com / OneCal for, free, no signup, and — crucially for me — it does NOT hide the
transform. The 1-point hold-back is below, not a dealbreaker.

## (b) Clarity: YES
Within 5s the H1 "One feed from all your calendars — work, personal, or team" + subline
"Paste 2–5 calendar links. Get one subscribable feed. No account." told me exactly what it
is and who it's for. The two URL fields with `https://example.com/calendar-1.ics`
placeholders made the input obvious. Nothing confused me.

## (c) Value: YES
Today I'd hand-merge in Google Calendar (subscribe to each separately — no real merge) or
script an ics concat in a Colab notebook and re-host it. This is faster AND it gave me the
audit trail I never get otherwise.

## What I actually verified (data-hygiene scrutiny — this is why I trust it)
Added 2 real feeds: gov.uk England bank holidays (83 events) + Google USA holidays (317).
- Unfiltered merge: UI said "400 events from 2 sources"; I fetched the real Feed URL over
  HTTP — `text/calendar`, **exactly 400 VEVENTs**, "Christmas Day" titles preserved verbatim.
  83+317=400. Nothing dropped, nothing silently rewritten. This is the whole ballgame for me.
- GLOBAL exclude "christmas" → UI 364, source math says 400−36=364. Exact.
- GLOBAL include "bank" → UI 33, and only the UK feed has "bank" titles (33). Exact.
- PER-FEED include "bank" on feed 1 only → UI 350, served feed 350 VEVENTs. = 33 UK bank +
  317 USA untouched. Per-feed AND-composition is correct; feed 2 was NOT filtered. Verified
  Juneteenth (USA) survived. Filters case-insensitive as labeled.
- The "Preview — exactly what subscribers see / Masks, labels and filters are already
  applied below — this is the real output" panel is exactly the transparency I demand.

## Per-feed keyword fields — could I find them COLD?
Partially. They're inside a collapsed "Options" disclosure (▸ Options) per feed, so they are
NOT visible at rest — I had to click to reveal include/exclude (placeholders `e.g. piano` /
`e.g. standup`). BUT the global filter block explicitly says "Want different keywords per
feed? Use that feed's Options," and the privacy mask says the same. That pointer is what made
me go open Options. Good signposting; a cold user who skips the helper text could miss them.

## What holds it back (the 1 point)
1. Honesty note I respect but want louder: "URLs are encrypted into the link... but they do
   transit the server." For a data-hygiene person that's fine because it's stated — keep it.
2. Per-feed filters are discoverable only via prose, not a visible affordance. A "filter"
   icon/badge on the collapsed Options row would make it self-evident without reading.
3. No CSV/text export of the merged event LIST for spot-auditing outside a calendar app — I
   verified by fetching .ics myself; a normal analyst can't. A "download .ics" or
   copy-event-list would let me audit without curl.

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["per-feed keyword fields hidden in collapsed Options — discoverable only via helper prose, no visible filter affordance", "no plain download/export of merged event list for non-curl auditing", "server-transit of source URLs is stated but easy to miss"], "priorConcernsAddressed": "n/a"}
```
