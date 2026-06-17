```json
{"tester":3,"name":"Wen","clarity":"Yes","value":"Yes","advocacy":6}
```

# Wen — Marketing data analyst (BigQuery/Sheets/Looker, distrusts invisible transforms)

## Round-1 blockers: BOTH FIXED — verified live
1. **Bad source warning at create time — FIXED.** I built england-and-wales.ics + a
   404 URL. The result panel showed immediately, no subscribing needed: "Merged 84
   events from 1 source. Source 2 could not be fetched — events from the remaining
   sources are included. The feed will retry those sources each time it refreshes."
   That's a real pre-flight surface. The 404 was not silently dropped. Exactly what I asked for.
2. **Merged event-count confirmation — FIXED.** Every build now shows "Merged N events
   from M sources" at create time. england+scotland → "Merged 114 events from 2 sources",
   and curling the feed gave exactly 114 VEVENTs / 114 unique UIDs. The UI count matches
   the bytes. The trust loop I had to close by hand in round 1 is now closed in the UI.

## NEW concern (and it's a real one for me): the dedup is lossy and silent
This is the thing that DROPPED my score from 8 to 6. The team added dedup, and it does NOT
key on UID. england=83 + scotland=94 = 177 raw events, **zero shared UIDs** (verified:
comm of UID sets = 0 overlap). Yet the merge produced 114 — it collapsed 63 events. I
reverse-engineered the key: SUMMARY+DTSTART. Proof: 63 events share an identical
title+start-date across the two feeds; union of SUMMARY+DTSTART keys = exactly 114.
"Christmas Day" appears 10× in England and 10× in Scotland (distinct UIDs, same dates) and
the merge keeps only 10.

Why this is a problem for a data analyst:
- It silently discards events that carry **distinct UIDs**. By every iCal standard the UID
  is the identity of an event; collapsing distinct-UID events is a lossy transform, and I
  was given no choice and no disclosure.
- The confirmation says "Merged 114 events" but never says "63 duplicates collapsed" or on
  WHAT key. That is the invisible transform I distrust most — I only know 63 vanished
  because I counted VEVENTs myself, which is the exact ritual the count was meant to retire.
- For gov.uk holidays the collapse is arguably *what a human wants* (one UK-wide Christmas).
  But the app made that editorial call for me silently. If two feeds legitimately have a
  same-named event on the same day that I want to see twice (e.g. two teams' "Standup" or a
  campaign-launch event duplicated across a regional and global calendar), I lose one with
  no warning.

Round-1 wins all still hold: UTF-8 fidelity ("New Year's Day" curly apostrophe intact),
Scotland-only events survive (St Andrew's Day, 2nd January present), failed source injected
as a backstop event, text/calendar content-type, no console errors.

## Clarity: Yes — new h1 "Stop checking three calendars" + "Paste 2–5 calendar links. Get
one feed. No account." is even sharper than round 1.

## Value: Yes — still beats my manual 3-calendar subscribe-and-clutter workflow.

## What would raise advocacy back to 9–10
1. **Disclose the dedup**: "Merged 114 events from 2 sources (63 duplicates collapsed)" — and
   ideally a tooltip naming the key (title + start time). Silence is the dealbreaker, not the dedup.
2. **Make dedup optional / key-configurable**: a "Collapse identical events" checkbox, default
   matching on UID (true duplicates) rather than title+date. UID-keyed dedup on these two
   feeds would keep all 177, which is the correct iCal-faithful default.
3. A one-liner that anyone with the feed URL can read the source list (carried over from round 1).
