# iCal Blend — Round 2 — Aisha (Product designer, craft-hard)

## Re-check of my round-1 blocker (the missing-space reconciliation count)
**FIXED — everywhere I could push it.** I checked the three states where a space bug hides:
- Default sample preview: `Fetched 408 events → kept 408 after filters & mask` ✓
- With include filter `holiday` so kept ≠ fetched: `Fetched 408 events → kept 33 after filters & mask` ✓ (the exact kept≠fetched case where "408after" appeared in R1)
- With busy-only mask on: `Fetched 408 events → kept 408 after filters & mask` ✓
My digit-glued-to-word scan (`\d(after|kept|events)`) returned **null** every time. The em-dash in per-source status (`[Personal] — 325 events fetched`) only *looked* glued in raw innerText; in the DOM it's a separate `ml-1` span and renders with a real gap. Environment artifact, not a defect.

## 1. Gut reaction (first 30s) — does craft feel considered now?
Yes. Generous whitespace, sane hierarchy, the headline does real work ("subscribe once… hand others a version with the private titles hidden"). The disabled Preview button paired with the line "Add a feed URL to preview." is a considered empty state — most builders leave that button live-but-dead. Status uses semantic spans + `aria-label="alive"` on the ✓. Reads like someone who cares.

## 2. One-click sample (confirm)
**Confirmed.** A single click on "Load a sample feed" populated two normalized sources (`[Holidays]`, `[Personal]`), per-source fetch status, the reconciliation line, AND the next-15 events — no second click, no spinner-then-nothing. Exactly what "preview & test before subscribing" should feel like.

## 3. Biggest remaining friction / top blocker
No blocker. Nits only:
- The sample only ever shows the happy path — every source is ✓ alive. I can't tell from it what a dead/404 feed looks like in this status list; a deliberately-broken sample source would teach the failure state.
- The next-15 list repeats holiday titles across years (two "Summer bank holiday", two "Christmas Day") — correct data, but causes a brief "wait, dupes?" double-take. A year hint or relative date would kill it.
- Copy tone is consistent and human; no clumsy strings found.

## Scores
- Clarity: 9 — one-breath pitch to a friend: "merge 2–5 calendar feeds into one subscribable link, filter or hide private titles, no account."
- Value: 8 — solves my real family-feed merge (personal + partner + kids' school ICS) in one link; the privacy mask is the part I'd actually brag about.
- Advocacy: 9 — my R1 craft blocker is genuinely gone, the preview is one-click and honest. Only the absent failure-state demo + duplicate-holiday double-take keep it off a 10; fix those and I bring it up unprompted in design Slack.

Aisha — adv:9 clarity:9 value:8 — top blocker: none; sample shows only the happy path (no dead-feed state) and repeated holiday titles across years cause a brief "are these dupes?" double-take

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Sample feed only shows happy path — no dead/404 source state demonstrated in the status list", "Next-15 preview repeats holiday titles across years with no year/relative-date hint, causing a 'are these dupes?' double-take"], "priorConcernsAddressed": "all"}
```
