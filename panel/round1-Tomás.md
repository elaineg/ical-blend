# Tomás — Round 1
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: none (one nit: server-side fetch of internal URLs needs a network-reach caveat)

## Walkthrough
- Cold open: headline "blend your work, personal, and shared calendars into one link... hand others a version with the private titles hidden." + "No account." nailed my exact job in one read.
- "LOAD A SAMPLE FEED" populated two real public feeds (gov.uk holidays, a Chelsea fixtures ICS) instantly. Clicked PREVIEW MERGED CALENDAR: got per-source STATUS (✓ [Holidays] 83 fetched, ✓ [Personal] 325 fetched) and a chronological "PREVIEW · NEXT 15" with real titles + source prefixes.
- Reconciliation line: "Fetched 408 events → kept 408 after filters & mask". Applied include filter "holiday" → it honestly dropped to "kept 33" and the list showed only holiday events. The count math MOVES and is verifiable — that's what earns my trust before I'd paste an internal URL.
- Busy-only mask ON: every preview row became "[Source] Busy" — titles genuinely stripped in the preview, not just promised. This is the killer feature for handing a vendor a stripped feed.
- Bad URL test: typed a garbage domain → red "✗ not-a-real-domain-xyz123.com — fetch failed" + "No feeds could be fetched — check the URLs above." Honest failure with a reason. No silent fail, no fake success.
- 0 console errors throughout.

## Answers
1. CLARITY: Yes. In ~30s I knew exactly what it does and that it's for me. Helpful words: "private titles hidden", "No account", "Preview & test them". Nothing confused me.
2. VALUE: Yes. Today I manually cross-check Teams/Outlook against a SharePoint shift feed — no clean way to merge, and zero safe way to share a stripped version. Excel/Tableau don't touch ICS. This does the merge AND the busy-only mask I can verify with my own eyes before exposing anything. Easily >once/week.
3. ADVOCACY: 9/10. Found Preview cold — yes. I'd bring this up unprompted to teammates fighting calendar sprawl. The preview-before-subscribe, visible reconciliation, and verifiable busy-mask directly answer my "wary of pasting company data" fear. Not a 10 only because URLs are "fetched server-side" — for an INTERNAL feed URL behind our firewall, a Vercel server can't reach it, and the page doesn't warn me that a private/intranet feed must be publicly reachable. I'd hit a confusing fetch-failed and wonder if it's me or them. A one-line "feeds must be reachable from the public internet" caveat would close that.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["No caveat that server-side fetch can't reach internal/firewalled feeds — my exact use case may silently fetch-fail"], "priorConcernsAddressed": "n/a"}
```
