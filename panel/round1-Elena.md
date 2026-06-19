# Round 1 — Elena (Eng Manager, 8 reports, 30-sec patience, laptop+phone)

## (a) Advocacy: 8/10
I'd bring this up unprompted to my fellow EMs and to my on-call lead. It does the exact
thing I've wanted: paste my team on-call feed + recruiting-interview feed + personal,
get ONE webcal link, subscribe on my phone, done. No login, no setup, no "create an
account to save." That's rare and it's the whole reason I'd recommend it.

Why not 9–10: two things hold it back for a phone-between-meetings user.
1. To USE the merged feed I still have to manually subscribe in Google Calendar via the
   webcal URL. There's an "Add to Google Calendar" button (good), but on my phone the
   webcal-subscribe dance is fiddly — that's a calendar-app limitation, not theirs, but
   it's the last 10% that decides whether my reports actually adopt it.
2. The page is one long form. Cold on my phone it's a lot of scrolling past Options,
   global keywords, busy-mask, before I hit "Create feed." Fine on laptop, busy on mobile.

## (b) Clarity: Yes
"One feed from all your calendars — work, personal, or team" + the subhead told me
exactly what it does in under 5 seconds. "Paste 2–5 calendar links. Get one subscribable
feed. No account." is perfect. I knew it was for me immediately. No confusion.

## (c) Value: Yes
Today I just live in a wall-to-wall Google Calendar and eyeball three separate
subscribed calendars hoping nothing collides — there's no merge. This genuinely
consolidates them into one subscribe-able feed I can hand to my team. That saves real
effort and I'd give it to my reports so they stop maintaining 3 separate subscriptions.

## NEW FEATURE — per-feed keyword filters (the thing I was asked to find cold)
- Could I find them cold? PARTIALLY. The per-feed Include/Exclude live inside a collapsed
  "Options" disclosure per feed. With my 30-sec budget I would NOT have opened "Options"
  on my own — "Options" is a vague catch-all label; I assumed it was advanced cruft and
  the GLOBAL "Only include / Exclude events containing" fields below the feeds are what
  caught my eye first. The grey hint "Want different keywords per feed? Use that feed's
  Options." is the only signpost and it's easy to scroll past.
- Once opened, it's excellent: "Keywords — this feed only", Include/Exclude side by side,
  placeholders piano,soccer / standup,lunch, and the microcopy "These ADD to the global
  keyword filters above — an event must pass both" nailed the AND-composition.
- I VERIFIED it works: global include "day" kept only *Day events; per-feed exclude
  "columbus" dropped Columbus Day from ONLY that feed (the other feed's same-date event
  "US Indigenous People's Day" still showed) — so per-feed AND global compose correctly.
- "Options · on" badge appears on a feed once a per-feed option is set — nice confirmation.

## Top blockers
1. Per-feed keyword fields are hidden behind a vague "Options" label — low discoverability
   for a hurried user; rename to something like "Per-feed filters & masking" or surface a
   hint inline. I only found it because I was told to look.
2. Long single-column form is heavy on mobile; "Create feed" is below a lot of optional
   config. Consider collapsing global keywords/busy-mask too, or a sticky create button.
3. Last-mile subscribe on phone still depends on the calendar app's webcal handling.

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Per-feed keyword filters hidden behind vague 'Options' label — not discoverable cold under a 30s budget", "Long single-column form heavy on mobile; Create feed buried below optional config", "Last-mile webcal subscribe on phone still fiddly (calendar-app limitation)"], "priorConcernsAddressed": "n/a"}
```
