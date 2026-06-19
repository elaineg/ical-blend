# Round 2 — Rob (freelance brand/visual designer)

Job attempted: merge several client booking ICS feeds into one availability calendar, and
share a busy-only version with a new client without leaking client names.

## Verdict
- (a) Advocacy: **8/10**
- (b) Purpose clear in 5s: **Yes**
- (c) Valuable to me: **Yes**
- Found PER-FEED keyword filters AND the active-filter badge COLD: **Y**

## Clarity — Yes
Headline "One feed from all your calendars — work, personal, or team" + subhead "Paste 2–5
calendar links. Get one subscribable feed. No account." told me what it is and that it's
free/no-login in well under 5 seconds. "Hide private titles from shared versions with one
checkbox" spoke directly to my client-privacy need. Nothing confused me on the cold open.

## The per-feed filters + badge (the thing I was told to hunt)
- Found "Options & filters" under each feed row immediately, with the micro-hint
  `prefix · keyword filter · mask` next to it — clear signpost without clicking.
- Expanded it cold: "Label added to this feed's event titles" (prefix), "Mask this feed's
  titles", "Hide all-day events", and "Keywords — this feed only · Include / Exclude". The
  note "These ADD to the global keyword filters — an event must pass both" is a genuinely
  sharp detail; it pre-answered my "wait, do these stack?" question.
- Active-filter BADGE: after I set include=booking / exclude=internal and collapsed the row,
  the summary read `Options & filters · on` with a badge line `include: booking · exclude:
  internal`. So I can see at a glance which feeds are filtered without re-expanding. Good.

## Value — Yes (this beats my "do it in Photoshop in 4 minutes" reflex, because Photoshop
can't do this at all; my real alternative is hand-juggling 3 subscriptions in Apple Calendar
or paying for a sync tool). The busy-mask is the killer:
- I merged two REAL public ICS feeds, ticked "Busy-only privacy mask," created the feed, then
  curled the generated /api/feed/... URL: HTTP 200, text/calendar, 351 events, EVERY line
  `SUMMARY:Busy`, and ZERO DESCRIPTION/LOCATION/ATTENDEE leaked. That's exactly what I'd need
  before sending a link to a new client — verified at the wire, not just a checkbox promise.
- The preview caption `2 sources · only "client" · busy-only mask on · 1 feed labelled ·
  1 feed masked` is the trust line that would actually make me hit send.
- "Add to Google Calendar" button + per-app subscribe instructions (Google/Apple/Outlook)
  mean I won't fumble the paste. Copy button verified: label flips to "Copied!" and the real
  feed URL lands in the clipboard.

## What holds it back from a 9–10
- Failed sources are reported, but the merged feed name on a bad run still read "iCal Blend:
  2 sources failed" as the calendar title — fine for me, but I'd rather the title stay clean
  and the error live only in the UI, so a client I forward it to never sees "failed."
- The feed URL is a giant opaque token and the caption warns my source URLs "transit the
  server" on every refresh. As a freelancer forwarding this to clients, that server-side
  fetch (vs. truly local) is the one thing that gives me mild pause — it's honest, but it's
  why I won't bring it up totally unprompted to privacy-touchy clients.
- No way I could see to nickname/title the OUTPUT calendar before subscribing (the on-device
  "recent blends" nickname is local-only); I'd want "Rob — Availability" to show in a client's
  calendar list.

Net: it did my actual job, the privacy mask provably works, and the per-feed controls are
well-signposted. Strong utility I'd recommend to other freelancers — just shy of unprompted-
evangelism because of the server-transit + output-naming gaps.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Failed-source run bakes 'X sources failed' into the calendar TITLE a forwarded client would see", "Source URLs transit the server on each refresh (honest, but gives privacy-touchy freelance clients pause)", "Can't name the OUTPUT calendar (e.g. 'Rob — Availability') before subscribing; nickname is on-device only"], "priorConcernsAddressed": "n/a"}
```
