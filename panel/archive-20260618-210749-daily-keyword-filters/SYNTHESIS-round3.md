# iCal Blend — Panel SYNTHESIS, Round 3

App: http://localhost:3000 (local prod build). Round 3 re-tested all 10 personas after the
round-2 P0 fix (UID-first dedup — no silent data loss, masked feed never overwrites an
unmasked feed's title), prefix-spacing fix, honest privacy copy, and recall polish.

## Per-persona table

| Persona | In-audience? | Adv R3 | Value <30s | Biggest remaining blocker |
|---------|--------------|--------|------------|---------------------------|
| Priya (backend eng) | Yes | 9 | Yes | No self-host/E2E path — server in trust path (DISCLOSED, not deception) |
| Marcus (frontend eng) | Yes | 8 | Yes | Count dishonesty: banner says "88 events", served .ics has 65 |
| Wen (data analyst) | Yes | 9 | Yes | None (nit: masked events get synthetic UID, undocumented — not a blocker) |
| Tomás (ops analyst) | Yes | 9 | Yes | No self-host option (DISCLOSED tradeoff, security team would want it) |
| Dana (demand-gen mktr) | Yes | 8 | Yes | Positioning is personal-calendar, not marketer-facing |
| Jules (community mktr) | Yes | 8 | Yes | No PER-FEED keyword filter (include/exclude is global only) |
| Aisha (product designer) | Yes | 9 | Yes | None that blocks (wants to subscribe own blend once before evangelizing) |
| Rob (freelance designer) | Yes | 8 | Yes | No on-screen preview of the masked/shared feed before copying link |
| Elena (eng manager) | Yes | 9 | Yes | None that stops her (inherent no-account URL tradeoff) |
| Sam (product manager) | Yes | 8 | Yes | No cross-device recall / re-derive from inputs |

All 10 are in-audience (multi-feed jugglers). Value clear <30s: 10/10 yes.

## In-audience at 9+: 5/10 (Priya, Wen, Tomás, Aisha, Elena)

Round 2 had 3/10 in-audience at 9+. Round 3 = 5/10. Net +2; zero regressions among the
three round-2 9s (all held or strengthened).

## Round 2 → Round 3 movement
- P0 RESOLVED (Wen, the round-2 P0 finder): audited real feeds — US=27 + CA=38 → merged=65,
  65/65 distinct UIDs, zero silent loss; masked CA = "[CA] Busy" titles stripped; unmasked US
  keeps real titles ("Christmas", "New Year's Day"); same-date events not collapsed. Adv → 9.
- Privacy overclaim FIXED (Priya, Tomás): copy now admits server decrypts+fetches feeds per
  refresh and config lives in the link. Both engineers raised score (Priya→9, Tomás 8→9).
- Prefix spacing FIXED (Aisha, Rob, Marcus): verified at byte level, exactly one space whether
  or not a trailing space is typed. Aisha holds a stronger 9; Rob 8; Marcus 8.
- Recall polish LANDED (Jules, Marcus, Sam): editable nickname prominent, persists across reload.

## Remaining sub-9 in-audience blockers — classified

1. **Marcus — count dishonesty (banner "88"/"Merged 88" vs 65 served VEVENTs).** IN-SCOPE-FIXABLE.
   The displayed merged-count must equal the count in the served .ics. This is the highest-value
   fix: it's a trust defect an engineer will share-or-shun on, and it likely also underlies
   Dana's "Merged 65" vs Marcus's "88" discrepancy (count computed pre-filter/pre-dedup vs
   post). One fix lifts Marcus toward 9. ROUND-4 FIX.
2. **Rob — no on-screen preview of the masked/shared feed before copying.** IN-SCOPE-FIXABLE.
   Preview already exists; extend it to render the masked rows ("[ClientA] Busy") so a designer
   sees the artifact before sharing. Elena got exactly this for her masked case and it moved her
   off hesitation. ROUND-4 FIX (small).
3. **Jules — no per-feed keyword filter (global only).** IN-SCOPE-FIXABLE but larger. Per-feed
   include/exclude is a real feature gap for her core use case; PARK candidate for a follow-on
   add-feature, not a round-4 blocker (functional, not broken).
4. **Dana — marketer-facing positioning.** IN-SCOPE-FIXABLE (copy-only). One marketer/event
   example line in the hero would push her to 9. Cheap ROUND-4 FIX.
5. **Sam — no cross-device recall.** OUT-OF-SCOPE / model-non-fit. Cross-device sync requires
   accounts, which violates the no-account wedge. PARK — does not gate.
6. **Priya / Tomás self-host asks** are already 9s (disclosed tradeoff), so non-gating; PARK as
   architectural.

## Verdict

NOT YET PASS (bar = every in-audience persona at 9+; currently 5/10). But the gap is narrow and
mostly cheap. The remaining sub-9 blockers split: 3 cheap IN-SCOPE round-4 fixes
(count-honesty, masked-preview, marketer copy line), 1 larger in-scope feature (per-feed
keyword filter — PARK as add-feature), 1 OUT-OF-SCOPE (Sam cross-device sync — PARK).

RECOMMENDATION: one more ROUND-4 fix loop targeting (a) merged-count honesty (Marcus —
highest leverage, also resolves the 65-vs-88 discrepancy), (b) masked-feed preview rows (Rob),
(c) one marketer example line in the hero (Dana). Those three plausibly move Marcus, Rob, and
Dana to 9 → 8/10 in-audience. Jules (per-feed filter) and Sam (cross-device) are PARK candidates,
not round-4 blockers.
