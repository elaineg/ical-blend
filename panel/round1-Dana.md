# Round 1 — Dana (Demand-gen marketer, medium tech, MacBook+phone)

Motivation: merge my webinar/event calendar feed + HubSpot campaign-milestone feed into ONE
feed I can subscribe to on my phone. Ruthless about time — value must land in one scroll.

## What I did (cold)
- Loaded cold. H1 "One feed from all your calendars — work, personal, or team" + subhead that
  literally names "webinar schedules" and "launch timelines for your whole team" = my exact job.
- Pasted 2 REAL public .ics feeds (US holidays x2 as stand-ins for my webinar/campaign feeds).
- Opened a per-feed **Options** disclosure, set per-feed INCLUDE = `Christmas` on feed 1 only.
- Set GLOBAL EXCLUDE = `Easter`. Hit Create feed.
- Verified the produced feed over HTTP: 200 text/calendar, 60 events. Feed-1 events were filtered
  to ONLY Christmas; feed-2 untouched (per-feed scope correct); zero Easter anywhere (global AND
  composition correct). Filters do EXACTLY what the labels claim. 0 console errors. Mobile 375px clean.

## Per-feed keyword fields — could I find them cold?
YES, but only after clicking "Options." They're collapsed by default. Two signposts saved it:
(1) the global filter helper text "Want different keywords per feed? Use that feed's Options," and
(2) inside the panel a "Keywords — this feed only … These ADD to the global keyword filters above —
an event must pass both." That one sentence is the best thing here — it told me the AND rule without
me guessing. Placeholders `piano, soccer` / `standup, lunch` made the comma=OR obvious. Good.

## (a) Advocacy — 8/10
I'd screenshot this into my team channel today. It nails the core job, the result screen has a
"Preview — exactly what subscribers see" list (confidence before I subscribe on my phone), per-platform
subscribe instructions, and "Add to Google Calendar." Honest privacy line. What holds it back from 9:
the per-feed keyword power is buried one click down with NO hint on the feed row itself that filtering
exists per-feed until you read the small global helper text — a teammate scanning fast will miss it.
And there's no "try a sample feed" — a less-technical colleague stalls at "where's my .ics URL?"

## (b) Clarity — Yes
In 5 seconds I knew what it does and that it's for me: merge calendar links into one subscribable feed,
no account. The subhead naming webinar/launch-timeline use cases sealed it. Nothing confused me.

## (c) Value — Yes
Today I manually keep my HubSpot campaign milestones and Luma/event dates in separate calendars and
eyeball them; there's no clean way to get ONE phone subscription. This produces exactly that, free,
no signup, and the per-feed + global filters let me strip noise (standups, internal-only) before it
hits a shared feed. Real time saved. Caveat: it can't tell me whether HubSpot/LinkedIn even EXPORT
.ics — that's my homework, not the app's fault, but a "what feeds work?" note would close the loop.

## Top blockers
1. Per-feed filter discoverability — collapsed "Options" + tiny helper text; easy to miss the power.
2. No sample/demo feed, so a non-technical teammate I'd share with may stall at sourcing an .ics URL.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["per-feed keyword filters are buried in a collapsed Options disclosure with only tiny helper text hinting they exist", "no sample/try-it feed, so a less-technical teammate stalls at sourcing their own .ics URL"], "priorConcernsAddressed": "n/a"}
```
