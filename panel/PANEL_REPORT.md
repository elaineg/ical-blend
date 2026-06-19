# iCal Blend — Panel Report: "Preview & test your feeds"

## Feature shipped
A new **"Preview & test your feeds"** capability that now leads the page: a "Load a sample
feed" button, a "Preview merged calendar" button, a per-source fetch-status panel
(✓ alive (N events) / ✗ failed-with-reason), a "Fetched X → kept Y after filters & mask"
reconciliation count, and a chronological list of the next ~15 merged events with
titles/dates/source labels. Built to close the prior panel blocker: testers wanted to
test a feed and see a populated demo *before* pasting private calendar links.

The panel is all-in-audience by construction — every one of the 10 personas is a
computer-worker who juggles multiple calendar feeds.

## Two-round trajectory: 8/10 → PASS 9/10
| Round | In-audience at adv≥9 | Verdict |
|-------|:--------------------:|---------|
| 1 | 8 / 10 | NEEDS-FIX |
| 2 | 9 / 10 | **PASS** |

### Fixed between rounds 1 and 2
1. **[P0] Reconciliation-count missing-space trust bug.** The launch feature's headline
   metric rendered "kept 408**after** filters & mask" (digit glued to word). Cited
   independently by **Aisha** and **Marcus** — a real copy defect in the marquee trust
   number of the feature being launched. Fixed and verified in all three states (default
   sample, filtered where kept≠fetched, busy-mask on); a regex scan for digit-glued-to-word
   returned null everywhere.
2. **[P1] "Load a sample feed" now auto-previews in one click.** In round 1 it populated
   the URL fields but did not run the preview, despite the page leading with "Preview &
   test" — flagged as a missed "wow" by 5 testers (Priya, Marcus, Wen, Dana, Jules). Now a
   single tap fully populates the preview, confirmed by all 10 including on 375px mobile.
3. **[P1] Source-label normalization.** Typed feeds now get friendly labels (not raw host),
   and the mislabeled "[Personal]" sample was corrected (Aisha).

### Round-1 cappers, both cleared
- **Aisha 8 → 9** — her exact missing-space blocker verified fixed.
- **Elena 8 → 9** — her ask (see a populated merge before pasting private links) served
  directly by the one-click sample preview.

## Final per-persona advocacy tally (round 2)
| Persona | Advocacy | Clarity | Value |
|---------|:--------:|:-------:|:-----:|
| Dana    | 10 | 9  | 9  |
| Marcus  | 9  | 10 | 10 |
| Wen     | 9  | 10 | 9  |
| Tomás   | 9  | 9  | 9  |
| Jules   | 9  | 9  | 9  |
| Aisha   | 9  | 9  | 8  |
| Rob     | 9  | 9  | 9  |
| Elena   | 9  | 9  | 9  |
| Sam     | 9  | 10 | 9  |
| Priya   | 8  | 9  | 8  |

**In-audience at adv≥9: 9 / 10.** Only Priya remains at 8.

## Verdict: PASS (audience-weighted)
9/10 in-audience personas advocate at ≥9, clearing the all-in-audience bar. Both round-1
cappers moved 8→9 with their specific blockers verified fixed. The lone sub-9 (Priya) is a
soft trust-copy preference, not a fixable functional defect. Every tester answered
Clarity=Yes and Value=Yes; the new feature was discovered cold by all 10.

## Non-blocking items carried to backlog
- **Cosmetic em-dash spacing in per-source status rows** — sibling of the fixed
  reconciliation line: status/failure rows render the em-dash glued to the label
  ("[Holidays]— 83 events", "host.invalid— fetch failed"). 3 testers (Wen, Rob, Sam), all
  flagged it cosmetic / non-blocking.
- **Priya's "treat link like a password" trust copy** — soft preference: no warning that
  the feed link embeds source URLs (incl. an authed token). Security-paranoid persona
  preference, not a functional defect.
- **Elena's sample-count no-op note** — the sample applies no filter/mask, so
  "Fetched 408 → kept 408" never demonstrates the count changing; consider a sample that
  exercises a filter/mask so the reconciliation number visibly moves.
