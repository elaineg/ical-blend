# iCal Blend — Panel SYNTHESIS Round 5 (final delta)

**Change tested:** copy-only hero reorder so the professional/team use case is co-equal with
personal. New H1: "One feed from all your calendars — work, personal, or team"; lead now gives
equal weight to "merging work, personal, and family calendars" AND "combining client projects,
webinar schedules, and launch timelines for your whole team." No logic/UI/preview/recall change.

## Re-tested (2)

### Dana — demand-gen marketer (was round-4 GATING BLOCKER)
- **Round4 → Round5: gating blocker → 8 (NOT blocking, soft-positive).**
- Her round-4 blocker is **FIXED**: the new H1 + rewritten lead give her use case
  (webinar/campaign feeds, "whole team") equal billing with personal. She explicitly sees
  herself as a **first-class user** now.
- Flow verified end-to-end on mobile 375px with real US/Canada holiday feeds: per-feed
  prefixes applied + visible in preview, one feed masked, "65 events from 2 sources, 2 feeds
  labelled, 1 feed masked," Feed URL + webcal:// + subscribe instructions, zero JS errors.
- (a) advocacy **8/10**; (b) value clear <30s **Yes**; (c) remaining: the "URLs transit the
  server" trust note + long opaque feed-URL string. **Classification: SOFT PREFERENCE, NOT an
  actionable defect** — the app is honest and the flow works. `priorConcernsAddressed: all`.

### Marcus — frontend engineer (was round-4 soft-8, no blocker)
- **Round4 → Round5: 8 → 9 (+1).**
- Reordered hero lands the use case faster than the old work-first framing. On a fresh full
  retest he found the per-feed "Hide all-day events" toggle (his exact requirement) and
  verified the served ICS at byte level: 65 events = 27 `[US]` real titles + 38 `[CA] Busy`
  masked, zero title leaks, UI count matches exactly. Count-honesty fix holds.
- (a) advocacy **9/10**; (b) value clear <30s **Yes**; (c) remaining: the all-day-drop filter
  is buried inside per-feed Options (discovery polish) + the disclosed server-transit note.
  **Classification: SOFT PREFERENCE, NOT an actionable defect.** Prior concerns all addressed,
  no regressions.

## FINAL FULL TALLY (10 personas)

**In-scope, in-audience at 9+ (8 of 8):**
- Rob — 9 (carried)
- Wen — 9 (carried)
- Priya — 9 (carried)
- Tomás — 9 (carried)
- Aisha — 9 (carried)
- Elena — 9 (carried)
- Marcus — **9** (re-tested, 8→9)
- Dana — **8 with gap = non-actionable soft preference; round-4 gating blocker RESOLVED** (re-tested)

**PARK (2):**
- Jules — per-feed keyword filters. Larger in-scope future add-feature, not a defect. PARK.
- Sam — cross-device recall. Out-of-scope (would need accounts). PARK.

## AUDIENCE-WEIGHTED BAR

Bar: every in-scope in-audience persona is at 9+ OR their only remaining gap is a soft
non-actionable preference (no defect) or out-of-scope/separate-feature (PARK).

- 7 of 8 in-audience personas at 9+.
- The 8th (Dana) is at 8 but her **only** remaining gap is a non-actionable soft preference
  (server-transit trust note); her round-4 gating blocker is fixed and she's now a first-class
  user. **No actionable in-scope defect remains.**
- Jules + Sam parked (future feature / out-of-scope-needs-accounts).

**In-scope-at-9 count: 7 of 8** (Dana at soft-8, no defect).

## VERDICT: SHIP

Dana's gating blocker is resolved (now first-class user, gap is non-actionable); Marcus moved
to a clean 9; all 6 carried personas hold at 9; Jules + Sam parked. No actionable in-scope
defect remains. **Recommend SHIP.**
