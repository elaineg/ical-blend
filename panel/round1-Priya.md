# Priya — Round 1 (Preview & test feature)
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: Sample loads URLs but stops short of auto-previewing — one extra click to see the payoff. Minor.

## Walkthrough
Cold load: H1 "Stop checking three calendars… one link you subscribe to once" + "Paste 2–5 calendar links. Preview & test them, then get one feed. No account." Job + no-signup clear in <10s. Spotted "LOAD A SAMPLE FEED" and "PREVIEW MERGED CALENDAR" with zero prompting.

Sample cold: filled the two source fields (gov.uk bank-holidays.ics + a fixtures.ics) but did NOT auto-render a merge — I still had to hit Preview. The pitch implied "populated merge instantly"; it's one click short of the wow. Not a dealbreaker.

Preview (sample): per-source status ✓ [Holidays] 83 events, ✓ [Personal] 325; "Fetched 408 → kept 408 after filters & mask"; chronological NEXT 15 with [source] labels. Counts reconcile cleanly — I trust it.

Bad-feed test (gov.uk + httpstat.us/404 + example.com html): genuinely honest. "✗ httpstat.us — fetch failed" vs "✗ example.com — not a calendar feed" — it distinguishes a 404 from a non-ICS body. Count dropped honestly to "Fetched 83 → kept 83", plus "2 sources failed — their events are not included", AND it injects a visible "iCal Blend: 2 sources failed" event into the merged calendar so I'd actually notice it in my client. That's failure honesty I never get from a hand-rolled merge script.

Privacy audit (my real concern): localStorage held only a device-local "recent blends" nickname list — no source URLs in a DB. No external network from the browser; fetches are server-side. Feed URL is /api/feed/<encrypted-blob> (config encrypted INTO the link, not a stored row). curl returns valid text/calendar VCALENDAR with s-maxage=300. End-to-end real and subscribable.

## Prior concerns (from my earlier keyword-filter round)
- "Options" → "Options & filters" rename: ADDRESSED (saw "Options & filters · on" this round).
- Stateless encrypted token / no plaintext URLs / no tracking: still holds.
- Trust-loop on the link: the create-feed disclosure is now refreshingly candid — "never stored persistently, but they do transit the server." It does NOT overclaim client-side. That candor is what earns the 9.

## Answers
1. CLARITY: Yes. H1 + subhead nail who/what/no-account on one screen. Nothing confused me.
2. VALUE: Yes. I juggle a PagerDuty/on-call ICS + team release feed + personal, and there's no clean no-login merger — people point you at paid tools or self-hosting a script. This merges + filters + busy-masks into one stateless URL I can curl-verify. I'd use it whenever a rotation/feed changes — more than weekly.
3. ADVOCACY: 9. Honest per-source failure reporting, reconciliation counts, encrypted-URL (no DB), and the candid "transits the server" caveat are exactly what makes a skeptic trust it. Held off 10 because the sample stops one click short of showing the merge, and ideally nothing would touch a server at all — but it's honest about it, so I'd recommend it.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Sample feed loads URLs but does not auto-preview the merge — one extra click before the payoff", "Source URLs transit the server (honestly disclosed) — a fully client-side fetch would close the last trust gap"], "priorConcernsAddressed": "all"}
```
