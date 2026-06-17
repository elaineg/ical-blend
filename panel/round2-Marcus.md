# Marcus — Frontend engineer (round 2)

(a) Advocacy: **9/10**
(b) Value clear in <30s: **Yes**
(c) Biggest remaining blocker: **Opaque feed URLs in the recall list — I still can't tell which blend is which until I nickname each one, and the synthetic "iCal Blend: 1 source failed" event lands inside my actual calendar, which I'd rather see as UI-only.**

## Re-check of my round-1 concern (silent fetch hang) — FIXED
Pointed feed 2 at `https://httpstat.us/429`. No hang. I got a clear "1 source could not be fetched / Feed 2 — fetch failed / remaining sources included, retries on refresh", and the failed feed was correctly dropped from the merge count (28 from 1 source, not 2). This was the dealbreaker last round; it's solid now.

## Fresh take
- Merged the two real holiday feeds: "Merged 59 events from 2 sources. 1 feed labelled. 1 feed masked." Prefix `[US] Juneteenth` applied, Canada feed correctly shows distinct `Busy` rows — masked titles don't leak and don't collapse. Privacy fix confirmed.
- Masked + prefix combo renders `[Work] Busy` exactly as promised, so two masked feeds stay distinguishable. Nice.
- Per-feed Options has the "Hide all-day events" toggle — that's exactly my "drop noisy all-day GitHub/holiday spam" need, no extra step.
- CSS craft is clean: aligned preview rows, right-aligned dates, monospace feed URL, no jank. Zero console/page errors across every flow.
- Privacy note ("encrypted, self-contained, nothing stored server-side") is right where I look, and Copy genuinely writes the URL to clipboard.

Why 9 not 10: the recall list keys on giant opaque tokens; a default auto-nickname (feed count/date or first hostname) would close it. I'd drop this in team Slack today.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Recent-blends list shows only opaque token URLs until I manually add a nickname; a sensible default label would help", "The '1 source failed' notice is injected as a real event into the subscribed calendar rather than staying UI-only"], "priorConcernsAddressed": "all"}
```
