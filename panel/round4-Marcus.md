# Round 4 — Marcus (frontend eng, 2 yrs, distrusts numbers that don't match reality)

## The count test (my round-3 blocker)
- Banner reported: **65 events** — exact wording: *"65 events from 2 sources at blend time. The live feed auto-refreshes. 2 feeds labelled. 1 feed masked."*
- I fetched the actual `.ics` from the produced Feed URL and grep'd it:
  - `BEGIN:VEVENT` = **65**, `END:VEVENT` = **65**
  - Refetched twice → 65, 65. Stable.
- **65 reported == 65 served. They match.** No discrepancy this time.

Bonus checks (because I don't trust on faith):
- Masked US feed → `SUMMARY:US Busy`, LOCATION/DESCRIPTION/UID-detail stripped, dates kept. Correct.
- Unmasked CA feed → full `SUMMARY:CA New Year's Day`, DESCRIPTION/LOCATION intact. Prefix applied once, no double-labelling.
- Console errors: 0. No janky CSS, layout's clean at 1280px.

## Round 3 → Round 4 movement
Round 3 I called this a BLOCKER: banner number didn't match the served VEVENTs, and to me a tool that lies about its own output is dead on arrival. **This is now FIXED.** The number is honest AND the "at blend time / live feed auto-refreshes" framing is exactly the right disclosure — it tells me the count is a snapshot of a live re-fetching feed, so if the upstream feed changes the number can drift. That's not dishonesty, that's how a subscribable feed *works*, and they said so plainly. I respect that. I went from "won't share" to "would share."

Movement: **3 → 8.**

## Answers
**(a) Advocacy: 8/10.** I'd drop this in team Slack — "no-signup ICS merger with per-feed Busy masks, and the served count actually matches what it claims." Not a 9/10 only because: the feed URL is a ~180-char opaque blob (ugly to paste/eyeball, and "lose the link, build a new one" means no edit/recovery), and it's a personal-data-transits-the-server tool — fine for holidays, but I'd hesitate before piping my real work calendar through someone's server, and that's the exact use case I came for. Honest disclosure is there, but it caps the "share my own private feed" enthusiasm.

**(b) Value clear in <30s: Yes.** "Stop checking three calendars / Paste 2–5 calendar links. Get one feed. No account." — I got it instantly, and the per-feed Options (prefix + mask + hide all-day) are exactly the knobs I wanted.

**(c) Biggest remaining blocker: None blocking.** Count integrity is solved. Remaining friction is the opaque non-editable URL and server-transit of private calendars — papercuts, not blockers.

```json
{"tester": 1, "round": 4, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Feed URL is a ~180-char opaque blob with no edit/recovery — lose it, rebuild from scratch", "Private calendar data transits the server (honestly disclosed, but caps enthusiasm for my real work feed)"], "priorConcernsAddressed": "all"}
```
