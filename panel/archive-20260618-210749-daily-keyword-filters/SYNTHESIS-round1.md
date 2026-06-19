# iCal Blend — Panel SYNTHESIS Round 1

Feature under test: PER-FEED rules (per-row "Options" disclosure → title PREFIX, "Mask this feed's titles", "Hide all-day events from this feed"), alongside the pre-existing GLOBAL "Busy-only privacy mask" + global keyword filters.

App: http://localhost:3000 (local prod build). 10/10 testers ran cold in a real browser.

## Audience-weighted bar (declared)

In-audience = anyone who juggles MULTIPLE calendar feeds and would consult a merged feed regularly (most knowledge workers: devs, PMs, analysts, ops, managers, marketers, parents juggling work+personal+kids).
Non-fit = someone who realistically uses ONE calendar / has no merge need (per-feed rules don't apply).
**PASS BAR = every IN-AUDIENCE persona advocates at 9+.** Non-fit personas report scores but don't gate.

All 10 personas are IN-AUDIENCE: every one was given a real multi-feed merge motivation (on-call+release+personal, sprint+personal+meetup, campaign+pipeline+personal, work+facilities, webinar+campaign, community feeds, family calendars, client booking feeds, on-call+recruiting+personal, Asana+release+personal). There are no non-fit personas this round.

## Per-persona table

| Persona | In-audience? | Advocacy | Value clear <30s | Biggest blocker |
|---------|:---:|:---:|:---:|---|
| Priya (backend eng)   | yes | 8 | yes | Google-hosted ICS feeds silently land in "could not be fetched" bucket on 429 throttle; no reason/retry messaging |
| Marcus (frontend eng) | yes | 8 | yes | Per-source fetch-failure message gives no reason/status code (429 reads as app breakage) |
| Wen (data analyst)    | yes | 6 | yes | **Cross-feed de-dup silently drops same-date+same-title events with no disclosure; dedup survivor keeps feed-1 transform, so a MASKED feed can LEAK a readable title** |
| Tomás (ops analyst)   | yes | 8 | yes | No explicit promise the pasted SOURCE feed URL isn't logged/stored server-side (only output config is reassured) |
| Dana (demand-gen mktr)| yes | 6 | yes | Per-feed "Options" disclosure is grey 11px text + tiny triangle — easy to miss; best feature stays near-invisible |
| Jules (community mktr) | yes | 8 | yes | None blocking; ~200-char opaque feed URL feels unwieldy/sketchy to share |
| Aisha (product designer)| yes | 8 | yes | Masking a feed silently discards its prefix → multiple masked feeds collapse to identical untagged "Busy" rows (can't tell them apart) |
| Rob (brand designer)  | yes | 8 | yes | No way to name/label or recall which opaque feed link went to which client |
| Elena (eng manager)   | yes | 8 | yes | Row 1 ships PREFILLED with a dummy googleapis feed URL → "is this mine or a sample?" pause + clear-field step (costs 30s-budget users) |
| Sam (PM)              | yes | 9 | yes | Long opaque feed URL looks fragile/intimidating to share on mobile (minor) |

In-audience PASS count: **1/10 at 9+** (only Sam). Mean advocacy 7.7.

## Dominant blockers, ranked by how many testers hit them

1. **Opaque/unwieldy feed URL — no naming/labeling/recall (4: Jules, Rob, Sam, + Elena adjacent).** The ~200-char token reads as fragile/sketchy to share and can't be told apart from other links you've handed out. Caps multiple 8s at sub-9.
2. **Per-feed Options discoverability — disclosure is visually faint (2 directly: Dana, + a watch-item across others).** Dana (6) calls the grey 11px + tiny triangle the reason the differentiator stays invisible. Note: most testers DID find Options instantly, so this is a strength-with-a-soft-spot, not a universal miss. The FRICTION-WATCH "added-feature-buried" risk did NOT materialize for most; Dana is the outlier and she's the most time-ruthless persona.
3. **Per-feed-mask correctness defects — two distinct, genuine bugs (2: Wen, Aisha).**
   - Wen: cross-feed de-dup (same date + same title) silently drops events AND lets the dedup survivor carry feed-1's transform, so a masked feed's title can leak as a readable title on a shared date. This is a privacy-mask correctness bug, not cosmetic.
   - Aisha: a masked feed discards its own prefix, so multiple masked feeds collapse into indistinguishable "Busy" rows (no "[Partner] Busy"). Provenance lost.
4. **Per-source fetch-failure messaging is silent/unexplained (2: Priya, Marcus).** A 429-throttled (Google-hosted) feed lands in the failure bucket with no status/reason; reads as app breakage and the summary still counts it as "labelled/merged" (counts intent, not reality).
5. **"Creating…" hang with no progress / timeout on slow or failing upstream (4: Priya, Wen, Tomás, + implied).** Several-second spinner with no progress; on a 429/slow feed it can appear hung indefinitely.
6. **Source-URL privacy reassurance gap (1, but high-signal for the privacy use case: Tomás).** The data-wary persona whose KEY use case is the mask won't paste an internal feed without an explicit "we don't store your source URL" promise.
7. **Onboarding friction — row 1 prefilled with a dummy URL (1: Elena).** Forces a "mine or sample?" pause + clear step before pasting.

## Notes on FRICTION-WATCH items
- **added-feature-buried:** mostly clear — 8/10 found per-feed Options instantly; the disclosure relabels to "Options · on" when active (well-liked cue). Only Dana flags the faint styling. Fix-worthy polish, not a true bury.
- **lexeme-collision (per-feed mask vs global Busy mask):** RESOLVED in copy — the global mask line "Applies to all feeds. Need it for just one? Use a feed's Options." cross-references cleanly; every tester who checked called the two clearly distinct. No confusion reported.
- **copy-feed-URL "Copied!" cue:** FIRES correctly for all testers who checked; clipboard genuinely held the URL (verified). No defect.
- Cross-cut non-app note: the provided Google UK Holidays feed returned HTTP 429 in the test environment (Google rate-limiting, not an app bug); affected testers substituted calendarlabs Canada Holidays.

## Recommendation: FAIL round 1 → round 2 fixes required

Bar is every in-audience persona at 9+; we are at 1/10. Eight personas sit at 8 and two at 6 — close, but real defects (one a privacy-correctness bug) hold them back. Required round-2 fixes, in priority order:

- **P0 (correctness/privacy):** Fix cross-feed de-dup so it never (a) silently drops events without disclosure, and (b) lets a dedup survivor leak a MASKED feed's real title. A masked feed must always render "Busy" regardless of dedup. (Wen)
- **P0 (mask UX):** Let a masked feed keep its per-feed prefix so masked rows are distinguishable ("[Partner] Busy"), or otherwise preserve provenance for multiple masked feeds. (Aisha)
- **P1 (the 8→9 lever for the most testers):** Address the opaque-URL friction — at minimum a one-line "this URL is self-contained and safe to share, nothing is stored" reassurance; ideally an optional per-feed nickname so the user can recall which link went where. (Jules, Rob, Sam, Elena)
- **P1 (fetch failure honesty):** Surface a per-source failure reason/status (e.g. "rate-limited (429) — retry") and stop counting failed feeds as merged/labelled in the summary; add a timeout so "Creating…" can't hang indefinitely on a slow/failing upstream. (Priya, Marcus, Wen, Tomás)
- **P2 (discoverability polish):** Make the per-feed "Options" disclosure visually stronger (larger/contrastier label, clearer affordance) so the differentiator isn't faint. (Dana)
- **P2 (onboarding):** Don't prefill row 1 with a dummy feed URL — use a placeholder instead so users aren't unsure if it's theirs. (Elena)
- **P2 (privacy copy):** Add an explicit "we don't log/store your source feed URLs" line near the input. (Tomás)
