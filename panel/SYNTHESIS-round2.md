# iCal Blend — Panel SYNTHESIS Round 2

App: http://localhost:3000 (local prod build, freshly rebuilt after round-1 fixes)
Round 1: 1/10 in-audience. Build was FIXED; all 10 personas re-tested cold.
Audience bar: in-audience = anyone juggling MULTIPLE calendar feeds. PASS = every in-audience persona advocates 9+.

## Per-persona table

| Persona | In-audience? | Adv (R1→R2) | Value clear <30s | Biggest remaining blocker |
|---------|--------------|-------------|------------------|----------------------------|
| Priya (backend eng) | yes | 1→8 | yes | Privacy note overstates: source URLs transit server (server-key encrypt, not E2E); honest but aggressive claim |
| Marcus (frontend eng) | yes | 1→9 | yes | Recall rows keyed on opaque URL until nicknamed (wants default label); "1 source failed" injected as a real calendar event |
| Wen (data analyst) | yes | 1→**2** | yes | **REGRESSION: P0 NOT fixed — merge silently drops 6/65 events AND collapses distinct events, corrupting unmasked feed titles** |
| Tomás (ops analyst) | yes | 1→8 | yes | Privacy note covers storage but not per-refresh server-side FETCH of his internal feed URL |
| Dana (demand-gen mktr) | yes | 1→8 | yes | Positioning all "work/personal"; no marketer-facing (webinar/HubSpot) example |
| Jules (community mktr) | yes | 1→8 | yes | Recall row leads with giant opaque URL, nickname buried/faint; Copy gives no "Copied!" confirmation |
| Aisha (product designer) | yes | 1→9 | yes | Craft nit only: `[CA]Busy` missing space between prefix and word |
| Rob (freelance designer) | yes | 1→8 | yes | `[Client]Busy` no-space (sloppy); no preview of saved blend contents beyond nickname |
| Elena (eng manager) | yes | 1→9 | yes | No "preview as recipient" view — hesitates one beat before sharing masked link |
| Sam (PM) | yes | 1→8 | yes | Recall is device-local only; no cross-device recall / reproducible link |

All 10 are IN-AUDIENCE (multi-feed jugglers). Value-clear: 10/10 yes.

## Round-1 → Round-2 movement

Massive lift on the polish/trust/recall levers — 9 of 10 personas jumped from 1 to 8–9. Confirmed FIXED across testers:
- Recall: "Your recent blends" + editable persisting nicknames + per-row Copy URL (Jules/Rob/Sam/Elena verified persistence across reload). This was the dominant 8→9 lever and it landed.
- Fetch failures: now show "HTTP 404 / 429" reasons, failed feed excluded from merge count, no silent hang (Priya/Marcus/Tomás/Aisha verified).
- Empty first row (Elena/Aisha verified).
- Per-feed Options disclosure visible (Dana verified — "found it in one click").
- Privacy note present near URL (all noted).
- Masked feed keeps per-feed prefix (Aisha's R1 blocker — verified `[CA]Busy` retained, distinguishable).

BUT one persona moved the wrong way / barely: **Wen 1→2**, because she is the only tester who fetched and event-counted the actual generated .ics.

## Dominant remaining blocker

**P0 REGRESSION — DATA INTEGRITY (Wen, in-audience):** The privacy/dedup fix is NOT actually fixed at the data layer. Wen measured: US Holidays = 27 VEVENTs + Canada = 38 = 65 events in, but the merged feed served only **59 — 6 events silently dropped** while the UI claims "Merged 59 events." Worse, dedup runs AFTER masking and compares masked titles, so two genuinely-distinct events collapse: on shared-title dates (New Year's Day, Good Friday, Easter), the masked Canada twin wins and **destroys the unmasked US feed's real title** — `[Work]New Year's Day` appears zero times, replaced by a single `[Work]Busy`. Contrast confirms root cause: differently-titled events (US "Christmas" vs CA "Christmas Day") both survive; identically-titled ones collapse.

This is THE exact "invisible transform / lost data" betrayal that kills the product for the most data-hygiene-sensitive user — and it silently corrupts ANY user's feed that has cross-source duplicate/identical titles plus masking. It is squarely in-scope (it IS the merge engine). The other 9 personas did not catch it because they trusted the "Merged 59 events" count and did not fetch+diff the raw .ics.

Note: Marcus's panel reported merge of "59 events / 2 sources" with no concern — consistent with Wen's input total, confirming the 59 figure and the 6-event loss are real, not a per-tester fluke.

### Secondary (non-blocking) themes
- Cosmetic: `[CA]Busy` / `[Client]Busy` missing a space after prefix (Aisha, Rob) — easy fix.
- Recall UX: nickname should be the bold row heading, opaque URL shrunk to a tail; add a default label; add "Copied!" confirmation (Marcus, Jules, Rob).
- Trust copy: privacy note should acknowledge source URLs TRANSIT and are FETCHED server-side per refresh, not just "nothing stored" (Priya, Tomás) — claim is currently slightly over-stated for skeptics.
- Out-of-scope / pre-existing asks (do NOT gate): cross-device recall / reproducible link (Sam), "preview as recipient" view (Elena), marketer-facing example copy (Dana).

## Recommendation: FAIL round 2 — go to round 3

In-audience PASS count: **2/10 at 9+** (Marcus 9, Aisha 9, Elena 9 = actually 3 at 9+; the rest 8 except Wen 2). Bar requires EVERY in-audience persona at 9+; 7 sit at 8 and one regressed to 2.

The decisive blocker is the **P0 data-integrity regression**: the merge drops events and collapses/corrupts distinct (including unmasked) events when source feeds share identical titles under masking. This must be fixed before any ship — it silently loses and mislabels user data while reporting success.

### Required round-3 fixes
1. **P0 — fix the merge/dedup engine (Wen):** dedup must run on STABLE identity (UID + DTSTART), NOT on the post-masking display title. Masking must not cause distinct events to collapse, must not drop events, must not overwrite an unmasked event's real title with a masked twin's. The "Merged N events" count must equal events actually emitted (no silent loss). Add a verifier test that fetches the generated .ics and asserts input-event-count parity + no title corruption on shared-title cross-source dates.
2. **P1 — prefix spacing:** render `[CA] Busy` with a space (Aisha, Rob).
3. **P1 — trust-copy honesty:** privacy note should state source URLs transit + are fetched server-side on each refresh (encrypted at rest in the link, not E2E) — close Priya/Tomás's "overstated claim" gap.
4. **P2 — recall polish:** nickname as bold row heading + URL as faint tail + default label + "Copied!" confirmation (Marcus, Jules, Rob).

Once #1 is fixed and re-verified by fetching the .ics, the 7 personas at 8 are within one polish round of 9 (their gaps are #2–#4), so round 3 is realistically the passing round.
