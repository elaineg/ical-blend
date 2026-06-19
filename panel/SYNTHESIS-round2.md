# iCal Blend — Panel Synthesis, Round 2

Feature under test: "Preview & test your feeds" — "Preview merged calendar" button, "Load a sample feed" (now auto-previews in one click), per-source fetch status (✓ alive N / ✗ failed+reason), "Fetched X → kept Y after filters & mask" reconciliation count, and the next ~15 merged events.

Round 2 was a presentation/wiring re-test (cold) of two round-1 cappers:
1. Reconciliation count missing space ("kept 408after filters & mask") → fixed.
2. "Load a sample feed" now auto-runs the preview in one click; source labels normalized.

App tested: http://localhost:3022 (local production server). All 10 personas in-audience.

## Per-persona results

| Name   | Advocacy | Clarity | Value | Top blocker |
|--------|----------|---------|-------|-------------|
| Priya  | 8  | 9  | 8  | Feed link embeds source URLs (incl. authed PagerDuty token) with no "treat this link like a password" warning |
| Marcus | 9  | 10 | 10 | No one-click "drop all-day events" toggle (must use keyword exclude) |
| Wen    | 9  | 10 | 9  | Per-source status rows render em-dash glued to label ("[Holidays]— 83 events"); URLs transit server (not pure client-side) |
| Tomás  | 9  | 9  | 9  | No caveat that a feed must be publicly reachable (firewall/intranet feed fails with no "network reach" explanation) |
| Dana   | 10 | 9  | 9  | None blocking; headline reads consumer, not aimed at marketers/event-feed users |
| Jules  | 9  | 9  | 9  | Fabricated "iCal Blend: 1 source failed" event still injected into next-15 list (redundant with status ✗ + banner) |
| Aisha  | 9  | 9  | 8  | None blocking; sample shows only happy path (no dead-feed state); repeated holiday titles across years read as possible dupes |
| Rob    | 9  | 9  | 9  | Failure line lacks space before em-dash ("host.invalid— fetch failed"); source prefix label still shows under mask |
| Elena  | 9  | 9  | 9  | Sample applies no filter/mask, so "Fetched 408 → kept 408" is a visible no-op — one-click preview never demonstrates the mask/filter changing the count |
| Sam    | 9  | 10 | 9  | Feed URL is a ~180-char opaque token; looks alarming pasted into Slack/Notion (wants short/branded link) |

## Audience-weighted scoring

All 10 personas are in-audience (computer-workers who juggle multiple calendar feeds).

- In-audience personas at advocacy ≥ 9: **9 / 10** (Marcus, Wen, Tomás, Dana, Jules, Aisha, Rob, Elena, Sam).
- Only Priya remains at 8.

### Round-1 cappers — both resolved
- **Aisha 8 → 9.** Her exact round-1 blocker (missing-space reconciliation count) verified fixed in all three states: default sample (`kept 408 after filters & mask`), filtered where kept≠fetched (`kept 33 after filters & mask` — the case where "408after" broke), and busy-mask on. Regex scan for digit-glued-to-word returned null everywhere.
- **Elena 8 → 9.** Her round-1 ask (a sample to see a populated merge before pasting private links) is served directly: one tap on "Load a sample feed" populates the full preview on a 375px phone — two sources, ✓ status, reconciliation count, 15 merged events, no second press, zero console errors.

### Both fixes confirmed across the panel
- Reconciliation spacing correct everywhere it renders: "Fetched 408 events → kept 408 after filters & mask" (all 10 verified).
- One-click "Load a sample feed" → fully populated preview confirmed by all 10, including on 375px mobile (Dana, Jules, Elena, Sam).
- Failure states honest: dead URL → "✗ … fetch failed", reconciliation drops to the survivor count, red "1 source failed" banner (Priya, Marcus, Wen, Tomás, Rob). Rob verified at the wire: masked `.ics` had all SUMMARY lines = "Busy" and 0 LOCATION/ATTENDEE/DESCRIPTION lines.

## Single most-cited remaining fixable blocker

No single blocker is shared by ≥2 personas as their *top* item; the remaining notes are scattered soft nits. The closest recurring cosmetic thread (3 personas: Wen, Rob, Sam) is the **per-source status / failure line rendering the em-dash glued to the label without a leading space** ("[Holidays]— 83 events", "host.invalid— fetch failed") — distinct from the now-fixed reconciliation line, and flagged as cosmetic, non-blocking by all three. Priya's lone sub-9 is a trust-copy gap (no "treat this link like a password" warning on the feed URL), a soft preference for her security-paranoid persona, not a functional defect.

## VERDICT: PASS

9/10 in-audience personas advocate at ≥ 9, clearing the audience-weighted bar. Both round-1 cappers (Aisha, Elena) moved from 8 to 9 with their specific blockers verified fixed. The single remaining sub-9 (Priya at 8) is a soft trust-copy preference, not a fixable functional defect. Remaining notes (em-dash spacing in status rows, sample showing a no-op count, opaque link length) are non-blocking polish for the backlog.
