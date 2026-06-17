```json
{"tester":4,"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":9}
```

# Tomás — Operations analyst, Edge on corporate Windows laptop — Round 2

## Prior concern (the round-1 blocker): FIXED — verified hard
My round-1 P0 was the UID leak: under busy-only mask the original event UID
(`...ChristmasDay@gov.uk`) passed through verbatim, leaking the identity I'm trying to hide
from a vendor. I rebuilt the exact merge (gov.uk England+Wales + Scotland, mask ON) and
curled the resulting feed. Evidence:
- `grep -ic "gov.uk"` → **0**. `grep -ic "christmas|holiday|bank"` → **0**. The source
  identity is GONE from the wire, not just the preview.
- Every UID is now `UID:busy-90bbf231@ical-blend` (opaque hex). All 114 unique.
- Deterministic: refetched the same feed URL, diff of the UID set was identical — so a
  subscribing client won't see phantom duplicate events on refresh. Good call.
- Properties shipped: only BEGIN/END, DTSTART/DTEND/DTSTAMP, SEQUENCE, SUMMARY, UID.
  ZERO DESCRIPTION / LOCATION / ATTENDEE / URL / X- identity lines. SUMMARY is uniformly
  `Busy`. HTTP 200, `text/calendar; charset=utf-8`.
This is exactly the fix I asked for, and it's airtight where it counts. I would now hand
this masked feed to a vendor.

## Clarity: Yes
New H1 "Stop checking three calendars" + subhead naming the busy-mask hand-off use case is
even clearer than round 1. The "Nothing is stored on the server — feed URL carries your
encrypted configuration" line still earns my trust as someone wary of pasting company data.

## Value: Yes
Same as round 1, but now usable for my real job. Today I'd screenshot my week or re-key
availability into Teams; this does merge + sanitize in one paste, browser-only (IT can't
block it), no account. The masked-feed hand-off is now safe, which is the whole reason I came.

## Remaining trust nit (NOT a blocker)
The mask's on-screen description still reads "descriptions, locations and attendees are
stripped" — it does NOT mention that event identifiers are now opaqued too. I only trust
the UID fix because I curled it myself; a non-curling user can't see that promise. Add
"...and event identifiers are replaced with anonymous IDs" to the mask label so the
guarantee is legible without a terminal.

## What would raise advocacy to 10
1. State the UID/identifier stripping in the mask copy (above) so trust doesn't require curl.
2. Still no "fetch failed / dead-feed" signal for an auth-gated SharePoint feed — I'd want
   to know a source was unreachable rather than silently absent.
3. A shorter share link; the feed URL is huge and will line-wrap in a vendor email/Outlook.
None of these are safety issues now, so I'm comfortable at a genuine 9.
