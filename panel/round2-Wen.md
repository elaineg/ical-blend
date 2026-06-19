# Wen — Round 2 (Marketing data analyst; data-hygiene, distrusts invisible transforms)

## Re-check of my prior complaints
- R1 nit: "Load a sample feed" populated URLs but did NOT auto-render the merge — I had to click Preview.
  **FIXED.** One click on "Load a sample feed" now populates both source URLs AND auto-renders the full
  preview: per-source status (✓ [Holidays] 83, ✓ [Personal] 325) + the reconciliation line, no second click.
  Verified: after a single click the recon line was already on screen.
- An earlier-build version of me wanted (a) a "fetched → kept" drop count and (b) per-source fetch status.
  **Both now exist and work** — see below.

## Specifically-confirmed this round
1. **Reconciliation count spacing/trustworthiness — PASS, this is what wins me.**
   Renders exactly: `Fetched 408 events → kept 408 after filters & mask` — proper spaces around the arrow
   and every word. I stress-tested the accounting:
   - Exclude "bank" → `Fetched 408 events → kept 375` (408−375 = 33 removed; bank-holiday rows visibly
     vanished). Reconciles to the event.
   - Add busy-only mask on top → held at `kept 375`. Correct: the mask TRANSFORMS titles to "Busy" (verified
     "Busy" titles appear) but does NOT drop events, so the kept count must not move. It didn't. A tool that
     confused mask-as-filter would fail here; this one accounts honestly.
2. **One-click sample → populated preview — PASS** (fixed nit above).
3. **Failure honesty — PASS, gold standard.** Swapped feed 2 to a 404 URL:
   - `✗ [Personal] — feed not found (404)`, red.
   - Recon honestly drops to `Fetched 83 events → kept 83` (dead source contributes ZERO — not counted alive).
   - Red warning `1 source failed — its events are not included.`
   - AND it injects a visible `iCal Blend: 1 source failed` event into the merged feed, so a SUBSCRIBER sees
     the failure in their actual calendar instead of silently losing events. Exactly the no-silent-failure
     behavior I demand of anything that touches my data.

## Answers
1. **Gut reaction / would I trust+use it?** Yes, immediately. Headline names the three calendars + one-link
   outcome; "Preview & test them, then get one feed. No account." sets expectations in <10s. The recon count
   and honest 404 are the data-hygiene guarantees most merge tools lack — I'd subscribe a campaign-launch
   feed + a dbt-run schedule feed + personal and trust the merge.
2. **Top blocker:** none that blocks use. Cosmetic nit only: per-source status renders the em-dash jammed to
   the label — `[Holidays]— 83 events fetched` (no space before the dash). The RECON line spacing is fine;
   only the status rows. Doesn't affect accounting, but I notice spacing glitches. Secondary, disclosed and
   acceptable: source URLs are encrypted into the link and fetched server-side, so not pure client-side.
3. **Clarity 10 · Value 9 · Advocacy 9.** Advocacy stays 9 (not 10) for the `]—` status spacing nit + the
   server-transit caveat. Everything I was suspicious of — invisible transforms, dropped events, partial
   merges — held under every filter/mask/failure probe I threw at it. I'd recommend this to other analysts
   unprompted because it respects data hygiene.

Wen — adv:9 clarity:10 value:9 — top blocker: none; cosmetic: per-source status renders "[Holidays]— 83 events fetched" with no space before the em-dash (recon line spacing is fine).

```json
{"tester": 10, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["per-source status renders '[Holidays]— 83 events fetched' with no space before the em-dash (cosmetic; recon line itself is correctly spaced)", "source URLs transit the server (disclosed, acceptable) so not pure client-side"], "priorConcernsAddressed": "all"}
```
