# Wen — Marketing data analyst (BigQuery/Sheets/Looker/dbt). Round 1.

I live in data hygiene and distrust tools that transform data invisibly. I tested the live app cold,
added two real holiday feeds (US + Canada — the Google UK feed 429'd my network, not the app's fault),
set a "[USA] " prefix on feed 1, masked feed 2, created the feed, and then fetched the raw merged ICS
and diffed it event-by-event against both source feeds.

## Clarity — YES
H1 "Stop checking three calendars" + sub "Paste 2–5 calendar links. Get one feed. No account." told me
exactly what it is in ~5 seconds: merge several ICS feeds into one subscribable URL, no signup. "and hand
others a version with the private titles hidden" telegraphs the privacy angle. I'd describe it to a
teammate verbatim. Nothing confused me up front.

## Value — Yes (with a caveat that matters to me specifically)
Today I'd hack this with a dbt/Python script that pulls ICS feeds and rewrites them, or just live with 3
separate subscriptions. This is genuinely faster — the per-feed Options are excellent and exactly what I
wanted: a "[USA] " label that hit ONLY feed 1's events and a per-feed mask distinct from the global one.
I verified in the raw output: all 27 US events carried "[USA] ", the Canada feed came through as "Busy",
and the per-feed mask checkbox ("Show this feed's events as Busy, keeping other feeds detailed") is clearly
different from the global "Busy-only privacy mask" ("Applies to all feeds. Need it for just one? Use a
feed's Options." — that helper line is what made the distinction click). The "Options · on" active-state
badge on a configured row is a nice touch.

## The fidelity problem (this is the one that bites me)
"Merged 59 events" — but my sources had 27 US + 38 Canada = 65. SIX events vanished with ZERO disclosure.
I diffed it: the app silently drops a second feed's event when it shares the SAME date AND SAME title as
an earlier feed. Dropped: New Year's Day, Good Friday, Easter Sunday (2025 + 2026 each). Defensible as
de-duping true duplicates — BUT (1) nothing in the UI says "6 duplicates merged," and the count "59"
actively hides it, and (2) the survivor keeps feed 1's transform, so on Jan 1 / Good Friday my MASKED
Canada feed leaks the readable "[USA] New Year's Day" title instead of "Busy." For a privacy mask that is
a real leak, not cosmetic. A tool that transforms data invisibly is exactly what I don't trust, and this
one does — quietly. UIDs are also fully rewritten (sources' UIDs gone), which breaks my ability to audit
provenance, though I get why for a merged feed.

Copy fired correctly: button flipped to "Copied!" and the real URL was on my clipboard. Google Cal button,
webcal:// link, and per-app subscribe instructions all present. Preview pane rendered the prefixed/masked
events accurately.

(a) Advocacy: 6/10. The per-feed controls are the best I've seen and the no-signup client-side story is
strong, but as a data person I caught a silent 6-event drop + a mask leak on de-duped days within minutes.
I can't recommend a merge tool to my team until it either discloses what it collapsed or never lets a
masked feed's event get replaced by another feed's plaintext title.
(b) Value clear in <30s: YES.
(c) Biggest blocker: silent cross-feed de-dup (same date+title) drops events with no "N duplicates merged"
disclosure AND lets a masked feed's event surface the OTHER feed's readable title — invisible transform +
privacy leak.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 6, "topComplaints": ["Silent cross-feed de-dup (same date+title) drops events with no disclosure; 'Merged 59 events' hid 6 dropped", "De-dup survivor keeps feed-1 title, so a MASKED feed's event leaks a readable title (e.g. '[USA] New Year's Day') instead of 'Busy' on shared dates", "Source UIDs are rewritten, removing provenance I'd use to audit fidelity"], "priorConcernsAddressed": "n/a"}
```
