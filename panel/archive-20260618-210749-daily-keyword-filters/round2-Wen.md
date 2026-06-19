# Round 2 — Wen (marketing data analyst; data-hygiene obsessive)

(a) Advocacy: **2/10**
(b) Value clear in <30s: **yes** — headline + subhead + "private titles hidden" land fast.
(c) Biggest remaining blocker: **MY R1 P0 IS NOT FIXED. The merge still silently collapses
distinct events when masking is involved, AND the collapse now destroys an UNMASKED feed's
real titles.**

Prior concern re-check: **NOT addressed.** It changed shape but the defect persists.

Hard evidence (I fetched both sources + the generated ICS and counted):
- Sources: US Holidays = 27 VEVENTs, Canada = 38 VEVENTs → 65 events in.
- Merged feed served **59** VEVENTs. **6 events vanished.** UI proudly says "Merged 59
  events" — a false all-clear that hides the loss.
- Repro: I labelled US `[Work]` (NOT masked) and masked Canada only. On dates both feeds
  share the same title (New Year's Day, Good Friday, Easter Sunday — 2025 & 2026 = 6 events),
  the merged output shows ONE event titled `[Work]Busy` with a synthetic `busy-<hash>` UID.
- `[Work]New Year's Day`, `[Work]Good Friday`, `[Work]Easter Sunday` appear **ZERO** times in
  the output. The US feed was never masked, yet its real titles are gone — masked Canada won
  the collapse and the survivor inherited US's prefix but Canada's "Busy".
- Root cause is observable: dedup runs AFTER masking and compares the MASKED title. Two
  genuinely distinct events ("Busy" from US, "Busy" from CA) look identical post-mask and get
  merged. Proof: on 20251225 US "Christmas" vs CA "Christmas Day" (different titles) BOTH
  survive; on 20250101 both "New Year's Day" collapse to one.

This is the worst possible failure for me: I came here BECAUSE I distrust invisible
transforms, and the tool both drops events and overwrites titles I explicitly chose to keep
visible — then tells me everything merged fine. The R1 fixes I can see (empty first row,
privacy note, "Your recent blends" recall with nicknames, per-feed Options visibility) are
genuinely nice, but they're polish on a feed I can't trust to be faithful. A merged calendar
that loses 6/65 events is worse than my three separate subscriptions. Fix: dedup on stable
identity (UID/DTSTART+ORIGINAL title) BEFORE masking, never across feeds with different
prefixes, and never let a masked event collapse an unmasked one.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "No", "advocacy": 2, "topComplaints": ["Merge silently drops events: 65 source events -> 59 merged, UI claims success", "Masking-after-dedup collapses distinct same-date events and DESTROYS the unmasked feed's real titles ([Work]New Year's Day -> [Work]Busy)"], "priorConcernsAddressed": "none"}
```
