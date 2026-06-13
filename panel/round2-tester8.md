```json
{"tester":8,"name":"Rob","clarity":"Yes","value":"Yes","advocacy":9}
```

# Rob — freelance brand/visual designer (round 2)

## My round-1 blocker — FIXED, verified hard
Last round I scored 8 because the busy-masked feed shipped the original `UID` verbatim
(e.g. `...NewYearsDay@gov.uk`), which with real client feeds would leak client names even
though SUMMARY said "Busy".

I rebuilt the exact masked feed: both gov.uk bank-holiday ICS feeds (England+Wales and
Scotland), busy-only mask on, then curl'd the result (`/api/feed/...`, 114 events):
- UIDs are now opaque hashes: `UID:busy-90bbf231@ical-blend`, `busy-764f11af@...`, etc.
- `grep -icE 'gov.uk|christmas|newyear|holiday|bank|scotland|england|boxing|easter...'`
  over the whole .ics returned **0**. Nothing about the source events survives.
- Every `SUMMARY` is `Busy` (only one unique value). DESCRIPTION/LOCATION/ATTENDEE: 0 lines.
- DTSTART/DTEND preserved, so the busy blocks land on the right dates.
- Re-curled — UIDs are identical (deterministic), so subscribers' apps won't duplicate
  events. That's the right call.
priorConcernsAddressed: my blocker = fully resolved.

## Clarity — Yes
The new h1 "Stop checking three calendars" + "hand others a version with the private
titles hidden" is actually a sharper pitch than round 1. I knew what it was and that it's
for me in under 10 seconds.

## Value — Yes
Today I share a Google free/busy link (one calendar only) or hand-build a throwaway
calendar to hide client names. This merges several client feeds AND masks identity in one
paste, no account. Now that the UID leak is gone, I'd genuinely trust it with a real client
booking feed. Beats my "rebuild it in Photoshop/by hand" reflex — there's no 4-minute
manual equivalent for a live merged feed.

## Advocacy — 9
The one thing that capped me at 8 is gone, and I confirmed it at the bytes level, so I'd
bring this up unprompted in my freelancer Slack. Not a 10 only because of two small things,
neither a privacy/trust issue:
- Auth-protected source feeds: my client booking platforms sometimes need a token in the
  URL. No note on whether those work — I'd want a line confirming token-in-URL feeds are
  fine (and that the token stays in the opaque config, not exposed).
- The feed URL is huge and overflows the box; I trust Copy but can't eyeball it. Minor.

Raise to 10: add a one-liner about private/auth feeds, and maybe a "test this feed" preview
that shows the masked output before I hand the link to a client.
