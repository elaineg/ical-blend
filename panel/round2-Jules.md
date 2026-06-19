# Jules — Round 2 (re-test; I was tester 3)

- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: the "1 source failed" line still rides inside the next-15 event list as a fake dated event
- Prior concerns addressed: some

## Re-check of my EXACT prior blockers
1. "Load a sample feed loads URLs but does NOT auto-preview — one extra click."
   FIXED. One click on LOAD A SAMPLE FEED now populates 2 feeds AND auto-runs the merge:
   I immediately saw STATUS (✓ [Holidays] 53 / ✓ [Personal] 355), "Fetched 408 events →
   kept 408 after filters & mask", and the next-15 list — zero extra clicks. Exactly what
   I asked for; this is the "instant merge" feel I wanted.
2. "'1 source failed' warning injected as a fake event inside the real next-15 list."
   NOT FIXED. With a clean sample it never appears (good). But when I swap in a dead URL
   (my real case — flaky Discord/Luma feeds), the next-15 list's FIRST row is still a
   fabricated event: dated "Fri, Jun 19", titled "iCal Blend: 1 source failed", tagged
   [Personal]. It already shows correctly in STATUS (✗ [Holidays] — fetch failed) AND as a
   red banner "1 source failed — its events are not included." So the in-list fake event is
   now redundant AND misleading — it looks like a real calendar entry I'd subscribe to.

## SPECIFICALLY CONFIRMED this round
1. One-click sample → populated preview: YES (verified above).
2. Reconciliation count + spacing: CLEAN. "Fetched 408 events → kept 408 after filters &
   mask" — proper spaces, real → arrow, no glued digits. Filter include="holiday" dropped
   it to "kept 33" with a "(375 removed by filters/mask)" subline and the list narrowed to
   only [Holidays] holiday events. Keyword filter visibly affects the count. ✓
3. Mobile 375px: NO horizontal overflow (scrollWidth=375=innerWidth). Full stacked layout,
   sample one-click + preview + reconciliation + next-15 all render and read fine on a
   phone. ✓
4. No login: confirmed — "No account, no database. Your source URLs are encrypted into the
   feed link and fetched server-side on each refresh — never stored persistently." This is
   why I'd actually use it for a small job.

## Answers
1. GUT REACTION: Yes, I'd use this no-login. In <10s the headline + "Paste 2–5 calendar
   links. Preview & test them, then get one feed. No account." tells me what and who. The
   one-click sample now sells it instantly — I see a real merged calendar before typing
   anything. This is the merged + keyword-filtered + masked feed I want for my Discord/Luma/
   newsletter ICS feeds, and nothing free/no-login does all three.
2. TOP BLOCKER: the fabricated "1 source failed" row inside the next-15 list (only on a
   feed failure). It's small, but it's the one thing that makes me trust the output slightly
   less — a status I'm reading as data. The STATUS row + banner already cover it; drop it
   from the event list.
3. CLARITY 9, VALUE 9, ADVOCACY 9. My #1 blocker (no auto-preview) is gone so I'd bring it
   up unprompted. Held off 10 only by the still-present fake-failure-event nit.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["On a feed failure, '1 source failed' still appears as a fake dated event inside the next-15 list (already covered by STATUS row + red banner — redundant and misleading)", "Minor: a lot of helper copy around filters/mask, though preview-first lets me learn by doing"], "priorConcernsAddressed": "some"}
```

Jules — adv:9 clarity:9 value:9 — top blocker: on a feed failure the "1 source failed" notice still renders as a fake dated event inside the next-15 list (already shown in STATUS + banner); drop it from the event list.
