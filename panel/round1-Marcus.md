# ical-blend — Round 1 — Marcus (frontend eng, 2yr, desktop Chrome + devtools)

**Advocacy: 8/10** · Clarity: Yes · Value: Yes

## (b) Clarity — Yes
Cold, in ~5s I got it from the h1 "One feed from all your calendars — work, personal, or
team" + sub "Paste 2–5 calendar links. Get one subscribable feed. No account." Two URL
inputs labeled "Source feeds (ICS / webcal URLs)" and a blue "Create feed" button made the
whole flow obvious without scrolling. The "No account / never stored persistently" line is
exactly the no-signup hook I'd repeat in Slack.

## (c) Value — Yes
Today I manually subscribe my GitHub milestone .ics + personal Google Cal + a meetup feed
separately in Google Calendar, and there's no way to drop the noisy all-day junk. This
gives me ONE webcal:// link, server-side auto-refresh, and — the thing that made me sit up
— a per-feed **"Hide all-day events from this feed"** checkbox. That's my exact pain point
("drop noisy all-day events"), per-feed, not global. Real test: blended two live public
holiday feeds → 76 events, valid `BEGIN:VCALENDAR`, HTTP 200, "Add to Google Calendar"
button + webcal link. This genuinely beats my current manual setup.

## Per-feed keyword fields — could I find them cold?
**Partially.** The fields are inside a per-feed **"Options"** toggle that's COLLAPSED by
default. I'd never have guessed there were per-feed keyword filters without clicking it —
but two things saved it: (1) the global filter helptext explicitly says *"Want different
keywords per feed? Use that feed's Options"*, which is a great breadcrumb, and (2) once
expanded the panel is excellent: Label, Mask, Hide all-day, and **"Keywords — this feed
only"** Include/Exclude with the note *"These ADD to the global keyword filters above — an
event must pass both."* That AND-composition is spelled out perfectly. So: discoverable via
the breadcrumb, not via the disclosure itself.

## Both filters work (verified)
- Global include "Day" → result said *"Only events matching 'Day'"* and feed regenerated.
- Per-feed exclude "Day" on feed-1 only → event count dropped **76 → 48**, proving the
  exclude is real and scoped to that one feed. 0 console errors throughout.

## What holds it back from a 9–10 (brutal)
1. **"Options" is a styled `<span>` inside a `<button>`, not a native `<details>`** — small
   pill, low contrast, easy to scan right past. The whole per-feed power (my killer all-day
   filter!) is buried behind a forgettable toggle. Promote at least the all-day toggle or
   add a hint like "Options · filters, labels, all-day".
2. **Slow "Creating…" with no progress/feedback** — server fetches the real feeds, took
   ~5–10s+ on a 76-event blend with the button just reading "Creating…". For a tool I'd
   demo live in Slack, I want a spinner or "fetching 2 feeds…" so it doesn't feel hung.
3. Minor: the generated Feed URL is one giant opaque encrypted blob; fine functionally,
   but I'd want a "Copy" confirmation toast (couldn't fully verify clipboard in test env).

Solid, no jank in the CSS, no errors. I'd share it — but the buried Options is the one
thing keeping it off a confident 9.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Per-feed Options (incl. my key all-day filter + per-feed keywords) collapsed behind a low-contrast span-button toggle — only found it via the global helptext breadcrumb", "Create feed shows 'Creating…' for several seconds with no spinner/progress on live multi-feed fetch"], "priorConcernsAddressed": "n/a"}
```
