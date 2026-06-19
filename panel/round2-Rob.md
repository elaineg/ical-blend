# Rob — Round 2 (freelance brand/visual designer)

Job attempted: merge several client booking ICS feeds into one availability calendar, and
share a busy-only version with a new client without leaking client names.
Feature focus this round: "Preview & test your feeds" before subscribing.

- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Prior concerns addressed: all

## Re-check of MY round-1 complaints
1. "Source prefix label still visible under mask — confirm it never auto-fills a client name."
   ADDRESSED / non-issue. Under the mask the title reads "[Holidays] Busy" / "[Personal]
   Busy" — the prefix DOES still show, but it's a per-feed field *I* type (feed → "Options &
   filters → prefix"); it never auto-fills from the URL or any client name. Clean client
   share = I blank the prefix. My control, honest behavior.
2. "Verify the downloaded .ics actually strips locations/attendees, not just the preview."
   CONFIRMED TRUE. I fetched the real /api/feed/... .ics with the mask on: all 408 `SUMMARY:`
   lines = "[Prefix] Busy", and **0 LOCATION, 0 ATTENDEE, 0 DESCRIPTION** lines in the whole
   103KB file. No "Chelsea"/"Christmas"/"New Year" anywhere. Copy now states it outright:
   "descriptions, locations and attendees are stripped." This is the trust-but-verify I
   wanted last round — it holds at the wire, not just on screen.

## Feature focus — all 3 confirmed
1. "Load a sample feed" → ONE click populated the FULL preview: per-source status + recon
   line + 15-row event list. No second click, no reload. PASS.
2. Reconciliation count: "Fetched 408 events → kept 408 after filters & mask" — correct
   spacing around the → and the "&". With mask on, still 408→408. PASS.
3. Busy-only mask in preview: 17 "Busy" rows, times kept, zero real titles. Per-source
   STATUS "✓ [Holidays] — 83 events fetched" / "✓ [Personal] — 325 events fetched". Bad URL
   → "✗ not-a-real-host.invalid — fetch failed" (honest, not swallowed). PASS.

## Answers
1. Gut reaction: Yes, I'd use this for client availability. Headline names my exact pain
   ("hand others a version with the private titles hidden"), the sample loads in one click,
   and I can PROVE the masked feed leaks nothing before pasting real client links.
2. Top blocker: none that stops me. Nit: the FAILURE line "not-a-real-host.invalid— fetch
   failed" has no space before the em-dash (the recon line itself IS spaced correctly, so
   it's just that one error string). I'd also default the prefix to blank under the mask,
   since a careless freelancer who named a prefix "[Acme]" would leak that name.
3. Clarity 9, Value 9, Advocacy 9. Not a 10 only because I haven't done a real
   subscribe-in-Google round-trip and I'd want default-safe prefixes under the mask;
   everything I distrusted in round 1 now verifies. I'd bring this up to other freelancers
   unprompted. My real alternative is hand-juggling 3 client ICS feeds in Google Calendar
   and screenshotting availability into Slack (which leaks names) — this kills that.

```json
{"tester": 6, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["failure line missing space before em-dash (\"host— fetch failed\"); recon line spacing is correct", "mask keeps my own [prefix] label visible — fine for me, but default-blank-under-mask would be safer for careless users"], "priorConcernsAddressed": "all"}
```

Rob — adv:9 clarity:9 value:9 — top blocker: none; only nit is no space before the em-dash in the failure line ("host— fetch failed"), the reconciliation line spacing is correct.
