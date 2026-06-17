# Round 3 — Wen (Marketing data analyst, data-hygiene sentinel)

**(a) Advocacy: 9/10**
**(b) Value clear in <30s? YES** — H1 "Stop checking three calendars" + subhead "Paste 2–5 calendar links. Get one feed. No account." told me exactly what it does and that there's no signup. The per-feed Options panel (prefix label / "Mask this feed's titles" / "Hide all-day events") is precisely the granularity a data person wants, and the footer line about source URLs being encrypted into the link, not stored, hits my distrust-of-invisible-transforms nerve in the right way.

**(c) Biggest remaining blocker:** Honestly minor — the masked CA events get a synthetic `busy-<hash>@ical-blend` UID (real CalendarLabs UID is dropped). That's defensible (don't leak the source UID through a privacy mask), but it's an undocumented transform, and I'm the persona who flags exactly that. A one-line note in the UI ("masked events are re-issued with anonymized IDs; times preserved") would close the last trust gap. Not a blocker to shipping.

## Data-integrity audit — EXACT counts
- Source US Holidays: **27 VEVENT**
- Source Canada Holidays: **38 VEVENT**
- Merged feed `/api/feed/<token>`: **65 VEVENT** = 27 + 38, **ZERO silent loss** (no keyword filters set)
- Distinct UIDs in merged feed: **65 / 65** — nothing collapsed
- App UI self-reported: "Merged 65 events from 2 sources. 1 feed labelled. 1 feed masked." — matches my count exactly.

## Title preservation / masking — CORRECT
- CA (masked + prefixed): exactly **38 events show `SUMMARY:[CA] Busy`**, with DESCRIPTION/LOCATION stripped, DTSTART/DTEND (times) KEPT, TRANSP:TRANSPARENT. Prefix + mask both applied correctly.
- US (unmasked): real titles fully preserved — `Christmas` keeps SUMMARY + LOCATION:United States + full DESCRIPTION. **NOT overwritten to "Busy", NOT prefixed.**
- Same-date / same-name across feeds NOT collapsed: e.g. "New Year's Day" appears twice (US 20250101 + 20260101, distinct DTSTART + distinct UID). A masked CA Jan-1 event and an unmasked US Jan-1 event coexist as separate VEVENTs.

## Round 2 → Round 3 movement
**Round-2 P0 is RESOLVED.** Last round events with different identities were silently collapsed and a masked feed overwrote an unmasked feed's real title. This round, with real US+CA feeds: 65=27+38 no loss, 65 distinct UIDs, US "Christmas/New Year's Day" keep real titles while CA shows "[CA] Busy". Dedup is now UID-first and masking is per-feed and non-destructive to other feeds. Advocacy 4→9. The merged feed faithfully preserves every event — which is the whole reason I'd use this over hand-merging in a script.

```json
{"tester": 0, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["masked events get synthetic UID with no UI note about the re-issue transform"], "priorConcernsAddressed": "all"}
```
