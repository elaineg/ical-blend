# Round 4 — Wen (marketing data analyst, data-integrity sentinel)

## Sentinel re-test: round-4 changes (merged-count banner + preview copy)
Verdict: NO REGRESSION. The banner and preview copy changes did not corrupt anything.

## Test setup
- US Holidays + Canada Holidays added; prefix `[US]` on US feed, `[CA]` on CA feed.
- Masked the CA feed only (per-feed "Mask this feed's titles"). Created blend, fetched the
  served .ics directly (HTTP 200, `text/calendar; charset=utf-8`).

## VEVENT count check — served vs source vs banner
| | VEVENTs |
|---|---|
| US source | 27 |
| CA source | 38 |
| Source total | 65 |
| Banner claims | **65** ("65 events from 2 sources at blend time") |
| Served .ics | **65** |
- Served SUMMARY distribution: 27 `[US] …` + 38 `[CA] Busy` = 65. Exact.
- 65 DTSTARTs, 65 UIDs, all 65 UIDs unique — no orphans, no collisions.
- **Zero data loss, proven by UID identity (not just count):** diffed all 27 US source UIDs
  against the 27 served non-busy UIDs — IDENTICAL. Every unmasked event survives.
- Masked CA feed: all 38 events present as busy placeholders (expected, NOT loss). Diffed
  the 38 CA source DTSTART dates vs the 38 served busy-event dates — byte-identical, no shift.
  Masking strips DESCRIPTION/LOCATION but KEEPS DTSTART/DTEND — correct privacy behavior.

## Title-integrity findings
- Prefixes applied cleanly: `[US] Juneteenth`, `[CA] Busy`. No double prefix, no stray space.
- No double-encoding / mojibake: scanned for `&amp;`, `=XX` quoted-printable, `Â/Ã`, stray
  backslash escapes — none. Apostrophes intact: `[US] New Year's Day`, `[US] Presidents' Day`.
- Unmasked US events keep original LOCATION, DESCRIPTION (line-folding + `\n` escape correct),
  original `@calendarlabs.com` UID. No injected VALARMs. Honest PRODID + `X-WR-CALNAME:iCal Blend`.

## Count-copy honesty
Honest. "65 events from 2 sources **at blend time. The live feed auto-refreshes.**" — the
number matches the served VEVENTs exactly AND it discloses the count is a snapshot that can
drift on live refresh, rather than pretending it's frozen. That caveat is exactly what I'd
want as someone who distrusts invisible transforms. "1 feed masked / 2 feeds labelled" also true.

## Three answers
(a) **Advocacy: 9/10 — HOLDS.** I re-ran the adversarial integrity audit and the merged feed
    is faithful to the byte. Not a 10 only because the masked feed still carries the `[CA]`
    prefix on every "Busy" line, which leaks the source label/volume to subscribers — defensible,
    but a privacy purist might want a "mask the label too" toggle. Tiny, not a blocker.
(b) **Value clear in <30s: Yes.** "Stop checking three calendars / Paste 2–5 calendar links.
    Get one feed. No account." plus per-feed mask + the trust line about URLs transiting but
    never being stored — I knew exactly what it does and that it respects my data hygiene.
(c) **Biggest remaining blocker: none.** No data loss, no title corruption, honest count.
    The round-4 banner/preview changes are correct.

```json
{"tester": 1, "round": 4, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Masked feed still shows the [CA] prefix on Busy lines, leaking source label/volume to subscribers — would like an optional mask-the-label toggle"], "priorConcernsAddressed": "all"}
```
