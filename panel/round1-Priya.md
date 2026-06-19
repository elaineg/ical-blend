# Round 1 — Priya (Senior backend engineer, keyboard-first, network-tab skeptic)

Cold task: merged 2 real public holiday ICS feeds into one subscribable feed, exercised
both per-feed and global keyword filters, and inspected the network/feed output.

## (a) Advocacy: 8/10
Genuinely good. It does exactly the on-call/release/personal merge I want, no login, and it
survived my paranoia audit. Held back from 9 by small trust/polish gaps, not by the core.

## (b) Clarity — Yes
"One feed from all your calendars — work, personal, or team" + "Paste 2–5 calendar links.
Get one subscribable feed. No account." told me the job and the no-signup promise inside 5s.
The two pre-seeded URL fields with `https://example.com/calendar-1.ics` placeholders make the
input format obvious. Nothing confused me above the fold.

## (c) Value — Yes
Today I'd hack this with a cron + `icalmerge`/a Python script on a box I own, or just live with
3 separate subscriptions in my client. This is faster than writing my own merge job and gives a
single live-refreshing URL I can paste into anything. The encrypted-token-in-URL design means
it's stateless — that's the detail that makes me actually trust it over a hosted service.

## Per-feed keyword fields — FOUND COLD: yes
Opened a feed's collapsed "Options" disclosure and immediately saw "Keywords — this feed only"
with Include (`piano, soccer`) / Exclude (`standup, lunch`). I found them partly BECAUSE the
global section says "Want different keywords per feed? Use that feed's Options." That forward-
reference is the discoverability bridge — without it, a disclosure labeled only "Options" is
generic. Suggest "Options & filters" on the summary so it's self-evident without scrolling to
the global hint.

## What I verified (network-tab paranoia)
- Per-feed exclude "Christmas" + global include "Day" composed as AND: server-side feed has 54
  VEVENTs, ALL titles contain "Day", ZERO Christmas. Filters are real, not cosmetic.
- Feed is `text/calendar`, proper `content-disposition`, sane `s-maxage` cache. No third-party
  host, no tracking pixel, only `POST /api/token` fired.
- Feed URL works with NO cookies/session (fully stateless) and my source URLs are NOT plaintext
  in the token — encrypted. "Never stored persistently" claim holds up to inspection.

## What holds it back (8 not 9–10)
1. The opaque ~250-char token URL is ugly and unverifiable to a non-engineer; I trust it because
   I decoded it, but I can't easily confirm rotation/expiry. A one-line "this link contains your
   encrypted sources; anyone with it sees your merged feed" warning would close the trust loop.
2. "Options" summary is generic — rename to "Options & filters" so per-feed keywords are
   discoverable without relying on the global hint.
3. No keyboard affordance called out; as a keyboard-first user I want tab order + an obvious way
   to add a source without the mouse (the "+ Add another source" is a link, reachable, fine, but
   undocumented).

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Opaque encrypted-token URL gives no visible 'anyone with this link sees your feed' warning / expiry info", "Per-feed 'Options' summary is generic — should say 'Options & filters' so keyword fields are discoverable without the global hint"], "priorConcernsAddressed": "n/a"}
```
