# iCal Blend — Panel SYNTHESIS, Round 1 (Preview & test your feeds cycle)

> NOTE: This OVERWRITES the prior SYNTHESIS-round1.md, which was from the keyword-filters
> cycle (round1/round2 of that cycle are superseded; raw round2-*.md on disk are stale).
> This is a NEW feature cycle: a GLOBAL landing-surface change ("Preview & test your feeds"),
> so all 10 personas re-tested COLD with no carry-forward. The panel for this app is
> all-in-audience (every roster persona has a real merge-multiple-ICS workflow).

## Change under test
A new "Preview & test your feeds" capability that now LEADS the page: "Load a sample feed"
+ "Preview merged calendar" buttons, a per-source fetch-status panel (✓ alive (N events) /
✗ failed-with-reason), a "Fetched X → kept Y after filters & mask" reconciliation count, and
a chronological list of the next ~15 merged events with titles/dates/source labels. Built to
close the prior panel blocker (Wen/Jules/Rob/Dana/Elena all wanted: pre-create feed test +
visible fetch status + populated demo before pasting private links).

## Per-persona table

| Persona | In-audience | Advocacy | Clarity | Value | Found-preview-cold | Top blocker |
|---------|:-----------:|:--------:|:-------:|:-----:|:------------------:|-------------|
| Priya   | Yes | 9  | Yes | Yes | Yes | Sample fills URLs but doesn't auto-preview (minor missed "wow") |
| Marcus  | Yes | 9  | Yes | Yes | Yes | none (nits: sample no auto-preview; "375after" missing space) |
| Wen     | Yes | 9  | Yes | Yes | Yes | none — all 3 prior concerns addressed; faithfulness held under scrutiny |
| Tomás   | Yes | 9  | Yes | Yes | Yes | none (nit: no caveat that server can't reach internal/firewalled feeds) |
| Dana    | Yes | 9  | Yes | Yes | Yes | Sample doesn't auto-preview — one extra tap before payoff (mobile) |
| Jules   | Yes | 9  | Yes | Yes | Yes | none (nits: no auto-preview; "1 source failed" injected as fake event) |
| Aisha   | Yes | 8  | Yes | Yes | Yes | **Copy bug: "kept 408after filters & mask" (missing space)** + source-label inconsistency |
| Rob     | Yes | 9  | Yes | Yes | Yes | none — busy mask verified ("Busy" replaces titles); prior concern solved |
| Elena   | Yes | 8  | Yes | Yes | Yes | Last-mile mobile webcal subscribe unproven inside her 30s budget |
| Sam     | Yes | 9  | Yes | Yes | Yes | none — held off 10 until he sees one round-trip into Google Calendar |

## Audience-weighted verdict

- All 10 personas are in-audience (this panel is all-in-audience by construction).
- **In-audience-at-9 count: 8 / 10.** (Priya, Marcus, Wen, Tomás, Dana, Jules, Rob, Sam.)
- Two below 9: Aisha (8) and Elena (8).
- Every tester answered Clarity=Yes, Value=Yes, and Found-preview-cold=Yes. The new feature
  was discovered COLD by all 10 — it successfully leads the page.
- Prior-blocker close-out: Wen, Jules, Rob, Dana, Elena all explicitly confirmed their PRIOR
  concern (test-before-subscribe / visible fetch status / populated demo) is now ADDRESSED.
  The feature landed for the exact personas it was built for.

## Complaints grouped by cause

### Trust-breaking / launch-feature defect (REAL, multi-persona, fixable) — drives Aisha's cap
- **Missing space in the headline reconciliation metric: "kept 408after filters & mask".**
  Cited independently by **Aisha** ("a real copy bug in the very feature being launched")
  AND **Marcus** ("kept 375after filters & mask"). It appears in the marquee trust number of
  the new feature, so it directly undercuts the credibility the feature exists to build.
  This is the single most-cited remaining fixable blocker. One-line fix.

### Craft / consistency (single-persona, Aisha) — secondary, same fix pass
- Source-label inconsistency: typed feeds show raw host ("www.gov.uk") while the sample shows
  friendly bracket labels ("[Holidays]"); one sample is mislabeled "[Personal]" (a football
  feed). Real but lower-severity; bundle with the copy fix.

### Onboarding friction — recurring nit, NOT a blocker (5 personas, all still scored well)
- "Load a sample feed" populates the URL fields but does NOT auto-run the preview, despite
  the page leading with "Preview & test." Named by Priya, Marcus, Wen, Dana, Jules as a
  "one extra click before the payoff." It cost nobody a Yes and most explicitly called it a
  minor nit / missed-wow, not a dealbreaker. Strong candidate for the same fix pass
  (auto-preview on sample-load would likely lift several 9s toward 10), but it is NOT what
  gates the bar.

### Out-of-scope / non-actionable for THIS preview cycle (PARK)
- Elena (8) & Sam: "last-mile webcal subscribe into Google Calendar on mobile is unproven in
  my session." This is a subscribe/handoff concern, not a Preview-feature defect — the
  preview itself fully satisfied them (both Found-preview-cold=Yes, Clarity/Value=Yes). Out
  of scope for this cycle; PARK for a future subscribe-flow cycle.
- Tomás (9): no caveat that server-side fetch can't reach an internal/firewalled feed. A
  true edge note, didn't cost his 9; PARK / backlog as a copy caveat.
- Jules: "1 source failed" warning is injected as a synthetic event into the next-15 list.
  Debatable design choice (makes failures impossible to miss); didn't cost a Yes. PARK.

## VERDICT: NEEDS-FIX

8/10 in-audience at adv≥9 — one short of the all-in-audience bar. The gap is NOT a soft
preference: Aisha's 8 is driven by a REAL, corroborated copy defect ("kept 408after filters
& mask") sitting in the launch feature's headline trust metric, cited by two testers. That
is exactly an actionable, fixable blocker, so it cannot be waved through as PASS.

Recommended single fix pass (small, all map to named complaints):
1. **[P0, gates the bar]** Fix the missing space → "kept 408 after filters & mask" (Aisha +
   Marcus). Likely lifts Aisha to 9+.
2. **[P1, same pass]** Normalize source labels (friendly label for typed feeds too; fix the
   mislabeled "[Personal]" sample) (Aisha).
3. **[P1, high-leverage]** Auto-run the preview on "Load a sample feed" so the cold demo is
   instant (Priya/Marcus/Wen/Dana/Jules) — should push several 9s toward 10.

Elena's and Sam's subscribe-round-trip concern is PARKED as out-of-scope for the preview
cycle; it does not block this verdict.
