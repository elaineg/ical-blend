```json
{"tester":1,"name":"Priya","clarity":"Yes","value":"Yes","advocacy":9}
```

# Priya — Senior backend engineer, round 2 (skeptical, network-tab checker)

## Round-1 blocker: FIXED (verified at the API, not just the UI)
My R1 blocker was that the app accepted link-local/localhost/non-calendar sources and
silently merged them. I re-tested cold:
- `http://localhost:8080/admin` → inline per-source error "Local or private addresses
  aren't allowed as calendar sources." No token minted.
- `not-a-url` → "That doesn't look like a calendar feed URL (needs to start with
  https:// or webcal://)." Good — distinct, actionable message.
- `http://169.254.169.254/...` (link-local) and `https://example.local/cal.ics` →
  both rejected as local/private.
- I went past the UI and hit `POST /api/token` directly with the link-local URL:
  HTTP **400**, body `{"error":"Local or private addresses aren't allowed... 169.254.169.254"}`.
  This is enforced server-side at submit time, not a client-side cosmetic guard. SSRF
  smell is gone — that was the one thing stopping me putting my on-call feed through it.

## Silent partial-merge: ALSO FIXED
R1 complaint #2 was that a 200-but-not-a-calendar source (example.com) merged with 0
events and no warning. Now I get a create-time confirmation: "Merged 84 events from 1
source. Source 1 could not be fetched — events from the remaining sources are included.
The feed will retry those sources each time it refreshes." A typo'd HTTPS feed no longer
vanishes silently. Exactly what I asked for.

## Core flow re-run with real feeds
Two gov.uk ICS feeds → "Merged 114 events from 2 sources." `curl` of the merged feed:
`content-type: text/calendar; charset=utf-8`, `content-disposition: inline;
filename="ical-blend.ics"`, `cache-control: public, s-maxage=300, swr=600`, 1 VCALENDAR /
114 VEVENT. Valid, subscribable, no console errors. Confirmation now shows the merged
event count up front — addresses my "validate each source on Create" ask.

## Remaining friction (minor, none blocking)
- Token URL is still ~170 chars — fine for paste, ugly in a terminal. Cosmetic.
- The new copy "Stop checking three calendars" is punchier but slightly less precise than
  the old "merge 2-5 feeds, encrypted in the URL" — the body subhead still carries it, so
  clarity holds.
- I'd love a per-source "fetched OK, N events" line on success (it shows the total and
  flags failures, but not a green check per good source). Nice-to-have, not a gate.

## Advocacy 8 → 9
My exact R1 conditions ("reject private/link-local targets in /api/token and surface
per-source failures on Create") are both met and I verified the 400 myself. I'd now put
my PagerDuty rotation through this and mention it in team Slack. Not a 10 only because
I haven't lived with it for a few weeks and the URL length is a small terminal annoyance.

priorConcernsAddressed: all
```json
{"tester":1,"round":2,"clarity":"Yes","value":"Yes","advocacy":9,"topComplaints":["token URL ~170 chars, ugly in terminal","no per-source green-check on success, only total + failures"],"priorConcernsAddressed":"all"}
```
