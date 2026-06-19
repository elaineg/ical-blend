# iCal Blend — Panel SYNTHESIS Round 4 (delta re-test)

App: http://localhost:3000 (live local prod build, freshly rebuilt + re-verified)
Round type: DELTA. Re-test 4 testers; 4 carried at 9; 2 PARK holdouts not re-tested.
Audience-weighted bar: every in-audience persona at 9+ EXCEPT holdouts whose only gap is
out-of-scope/architectural or a larger separate-feature ask (those PARK, don't gate).

## Re-tested (4) — round3 → round4 movement

| Tester | Role | R3 | R4 | Blocker status |
|--------|------|----|----|----------------|
| Marcus | Frontend eng | 3 | **8** | FIXED — count honesty. Fetched served .ics = 65 VEVENTs, banner said 65, exact match across 3 refetches. "at blend time / live feed auto-refreshes" disclosure accepted as honest. Held off 9 only by papercuts (long non-editable URL; data-transits-server, honestly disclosed). No remaining blocker. |
| Rob | Freelance designer | 6 | **9** | FIXED — preview before copy. "Preview — exactly what subscribers see" card renders masked feed as `[ClientA] Busy` with all real US holiday titles suppressed; unmasked feed keeps real titles. Can now trust the mask before sharing with a client. Nit: preview shows 10 events unlabeled as a sample. |
| Dana | Demand-gen marketer | bounced (~5) | **7** | FIXED (literal blocker) — new marketer hero line put her use case on screen in first scroll; she stayed and ran the full flow successfully (prefix + mask + webcal phone link all work). NOT at 9: positioning *hierarchy* — H1 + lead still front "work/personal/shared," marketer line bolted on the end. "I believe it's for me; I don't yet feel it was built for me." In-scope, addressable copy reorder. |
| Wen | Data analyst (SENTINEL) | 9 | **9 (holds)** | NO REGRESSION. Fetched served .ics, diffed UIDs vs source: US 27 unmasked UIDs identical to source; CA 38 masked busy-placeholders, dates byte-identical, no loss. Prefixes clean, no corruption/mojibake. Count copy honest. Nit: masked Busy lines still carry `[CA]` prefix (leaks source label/volume) — wants optional mask-the-label toggle. |

## Carried at 9 (4 — passed R3 on untouched surfaces, not re-tested)
- Priya (backend eng) — carried 9
- Tomás (ops analyst) — carried 9
- Aisha (product designer) — carried 9
- Elena (eng manager) — carried 9

## PARK holdouts (2 — explicit non-gating)
- **Jules** (content/community marketer) — wants per-feed keyword filters. Larger IN-SCOPE
  future add-feature, not a defect. PARK (does not gate).
- **Sam** (PM) — wants cross-device recall. OUT-OF-SCOPE: requires accounts, violates the
  no-account wedge. PARK (does not gate).

## In-audience-at-9 tally (8 in-scope-addressable testers)
At 9+: Rob (9), Wen (9), Priya (9), Tomás (9), Aisha (9), Elena (9) = **6 of 8**
Below 9: Marcus (8 — no remaining blocker, papercuts only), Dana (7 — positioning hierarchy, in-scope copy)

## Verdict: NOT YET PASS — one in-scope fix

Round 4 cleanly closed the three literal re-tested blockers (count honesty, preview-before-copy,
marketer hero presence) and the sentinel confirmed ZERO data-integrity regression. But the
audience-weighted bar requires every in-scope-addressable in-audience persona at 9+, and we are
at 6 of 8.

- **Marcus (8):** has NO remaining blocker — both gaps are honestly-disclosed papercuts. A
  half-point from 9; arguably a soft pass but literally below bar.
- **Dana (7):** the GATING item. Her literal blocker was fixed but a deeper in-scope issue
  surfaced: the marketer line is bolted onto a personal-first hero hierarchy. She doesn't feel
  the tool was *built* for her. This is an addressable copy/positioning reorder, not architecture.

REMAINING IN-SCOPE FIX (one, to reach bar): reorder the hero so the marketer/team use case is
co-equal in the H1/lead — not appended — so Dana (and the marketer segment) feel built-for.
Cheap secondary polish (non-gating, raises Marcus/Rob/Wen confidence): label the preview
"showing 10 of 65" and offer an optional mask-the-label toggle so masked Busy lines can drop the
source prefix.
