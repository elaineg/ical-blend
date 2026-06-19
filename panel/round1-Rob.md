# Rob — Round 1
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: none (minor: source prefix "[Personal]"/"[Holidays]" still shows under the mask — fine since those are my own labels, but I'd want to confirm a feed's prefix never auto-fills a client name)
- Prior concern addressed: Yes

## Walkthrough
Cold load. Headline: "Stop checking three calendars: blend your work, personal, and shared calendars into one link you subscribe to once — and hand others a version with the private titles hidden." Subline: "Paste 2–5 calendar links. Preview & test them, then get one feed. No account." That's me in one read.
- LOAD A SAMPLE FEED: clicked cold, instantly populated two real feeds (gov.uk holidays + a Chelsea fixtures ICS).
- PREVIEW MERGED CALENDAR: per-source STATUS ("✓ [Holidays] — 83 events fetched", "✓ [Personal] — 325 events fetched"), honesty line "Fetched 408 events → kept 408 after filters & mask", and a chronological "PREVIEW · NEXT 15" list. Exactly what I wanted before pasting client links.
- BUSY-ONLY MASK (my key use case): checked it, re-previewed — every title became "Busy". No "Chelsea", no "Christmas Day" anywhere. Titles gone, times kept (17 "Busy" entries). I could PROVE to myself it's safe before sharing with a new client. Deciding feature.
- BAD URL: typed junk .ics + one good feed. Got "✗ example.com — feed not found (404)" next to "✓ www.gov.uk — 83 events fetched", plus banner "1 source failed — its events are not included." Honest, per-source, didn't silently swallow it.
- Zero console errors throughout.

## Answers
1. CLARITY: Yes. Headline + "Preview & test them, then get one feed. No account." told me what it is, who it's for, and no signup, inside ~10s. "private titles hidden" is what hooked me.
2. VALUE: Yes. Today I eyeball 3 client booking ICS feeds in Google Calendar or screenshot availability into Slack — which leaks client names, the exact thing I'm paranoid about. This merges them into one subscribable link AND the busy-only mask shares availability with NO names. Not "4 minutes in Photoshop" — it's a recurring weekly leak risk this kills. I'd subscribe once and reuse the masked link with every new client.
3. ADVOCACY: 9. Preview-before-paste + a provable busy mask is exactly the friction I had, verified cold with the sample. Not a 10 only because I haven't pasted my REAL client links yet, and I'd want to open the downloaded .ics once to confirm it actually strips locations/attendees (copy says it does; I'd trust-but-verify). I'd bring this up unprompted to other freelancers.

```json
{"tester": 6, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["source prefix label still visible under mask (own label, not client name, but confirm it never auto-fills a client name)", "want to verify downloaded .ics actually strips locations/attendees, not just on-screen preview"], "priorConcernsAddressed": "all"}
```
