# Jules — Round 1 (re-test; I was tester 3 prior round)
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: none (one nit only)
- Prior concern addressed: Yes

## Re-check of my exact prior blockers
1. "No test/validate feed before Create — dead/auth feeds fail silently after subscribe."
   FIXED. The page now leads with Preview. A bad URL shows ✗ "...example — fetch failed",
   the good feed still gets ✓ 83 events, the count honestly drops ("Fetched 83 → kept 83"),
   and a banner reads "1 source failed — its events are not included." I see the dead feed
   BEFORE I ever click Create. This is exactly what I asked for.
2. "Dense helper copy; per-feed vs global AND relationship not obvious."
   IMPROVED, not perfect. Still a fair amount of helper text, but the Preview-first flow
   means I now learn by doing instead of reading — I no longer have to parse the copy to
   trust it, the counts do that. I'll call this addressed for my purposes.

## Walkthrough (incl. mobile notes)
- LOAD A SAMPLE FEED (cold): populated 2 real URLs (gov.uk holidays + a fixtures .ics).
  Did NOT auto-preview — one extra click on Preview. Mild ding vs "instant merge."
- PREVIEW MERGED CALENDAR: per-source ✓ status + "Fetched 408 → kept 408 after filters &
  mask" + chronological NEXT 15 with [source] labels. Counts add up — I trust it.
- Keyword filter include="Chelsea": 408 → kept 325, list narrowed correctly.
- Busy-only mask: titles → "Busy", times kept. The shareable privacy version I wanted.
- BAD URL: honest ✗ failed-with-reason + partial success preserved (see prior-concern #1).
- Create feed: real subscribable feed — https + webcal:// links, Add-to-Google-Calendar
  button, per-app instructions, honest privacy note (URLs encrypted into link but transit
  the server). Copy verified (clipboard read returned the URL; label → "Copied!"). I curled
  the feed endpoint: valid VCALENDAR, all 408 VEVENTs, source prefixes intact. Not vapor.
- Mobile 375px: no horizontal overflow (scrollWidth=375); full flow incl create+copy works.

Nit: the "1 source failed" warning is injected as a fake event at the top of NEXT-15 —
clever, but reads oddly next to real events.

## Answers
1. CLARITY: Yes — "blend your work, personal, and shared calendars into one link… No
   account" + "Paste 2–5 calendar links. Preview & test them, then get one feed" told me
   what and who in <10s. "No account" is what makes me try it.
2. VALUE: Yes — today I subscribe to my Discord/Luma/newsletter ICS feeds separately and
   mute noise; no free no-login tool merges + keyword-filters + masks them into one webcal
   link. This does it in one session. I'd use it whenever I re-cut feeds — >1x/week in
   event season.
3. ADVOCACY: 9/10 (up from my prior 8) — my #1 blocker is gone, so I'd now post about it
   unprompted. Held off 10 only by the sample not auto-previewing and the fake-warning-event
   nit; neither blocks the job.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Sample feed loads URLs but does not auto-preview the merge (one extra click)", "'1 source failed' warning injected as a fake event inside the real next-15 list"], "priorConcernsAddressed": "all"}
```
