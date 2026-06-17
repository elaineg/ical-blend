# Round 3 — Tomás (Ops analyst, Edge, wary of pasting internal feed URLs)

(a) Advocacy: **9/10**  (round 2: 8 → +1)
(b) Value clear in <30s: **Yes** — "Paste 2–5 calendar links. Get one feed. No account ... hand others a version with the private titles hidden" plus a labelled feed list and a visible "Busy-only privacy mask" checkbox. I knew what it was and that the mask was my feature before scrolling.
(c) Biggest remaining blocker: **No self-host / "fetch it yourself" escape hatch.** The privacy note is now honest that my internal feed URL transits their server on every refresh — which is the right disclosure, but it also means the answer to "can I avoid a third-party proxy touching the internal feed?" is still no. For a low-sensitivity vendor feed I'm fine; for the actual internal Teams/facilities feed my security team would still want a self-hostable option. That's the only thing between this and a 10.

## Round-2 → Round-3 movement
- **My round-2 blocker (server-side FETCH not disclosed) — FULLY ADDRESSED.** Result-page note now reads: "On each calendar refresh, our server decrypts the link and fetches your feeds to merge them — the URLs are never stored persistently, but they do transit the server." That is precisely the question my security team asks, stated plainly and without overclaim. This is the honesty fix I wanted; it raised my trust and my score.
- Prefix spacing fine (`Work Busy`, `Holidays Canada Day` — clean single space).

## Did the masked feed truly hide titles? YES — verified end-to-end in the served .ics
- Fetched the real `/api/feed/<token>.ics` (22.7 KB, 65 events, HTTP 200, no console errors).
- Every event from the masked US feed: `SUMMARY:Work Busy` — real US holiday names (Independence Day, Thanksgiving, etc.) are GONE. grep for US holiday names found zero leaks; the only "Thanksgiving" hits are the Canada (unmasked) feed, as intended.
- A masked VEVENT has NO DESCRIPTION, NO LOCATION, NO attendees, and even the UID is regenerated to `busy-65e5ccda@ical-blend` — no source identifier leaks. This is a genuinely safe vendor handoff, exactly what I came for.
- Per-feed mask works: US masked, Canada kept detailed in the same blend. Prefix survives masking.

## Fresh take
- Flow worked first try: two feeds, per-feed Options (label + "Mask this feed's titles" + "Hide all-day events"), one feed masked, Create. Preview matched the .ics. Outlook/O365 subscribe instructions are spelled out — relevant to me on Edge/Office 365.
- Honest privacy copy actually INCREASED my confidence vs round 2; a vendor-only stripped feed is now something I'd hand over today.

```json
{"tester": 0, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["No self-host/proxy-free option — internal feed URL still transits a third-party server on every refresh (now honestly disclosed, but unavoidable)", "For highly-sensitive internal feeds my security team would still want a self-hostable build"], "priorConcernsAddressed": "all"}
```
