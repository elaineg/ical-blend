```json
{"tester":3,"name":"Wen","clarity":"Yes","value":"Yes","advocacy":8}
```

# Wen — Marketing data analyst (BigQuery/Sheets/Looker, distrusts invisible transforms)

## Clarity: Yes
Within 5 seconds I knew exactly what it is. The h1 "iCal Blend" + subhead "Merge 2–5
calendar feed URLs into one subscribable feed — with optional keyword filters and a
busy-only privacy mask. No account, nothing stored: your whole setup lives encrypted
inside the URL." told me the what, the limits, and the privacy model in one breath.
The "Nothing is stored on the server — the feed URL itself carries your encrypted
configuration" line spoke directly to my data-hygiene paranoia.

## Value: Yes
Today I'd hand-merge a campaign-launch ICS, a dbt-run schedule ICS, and personal by
subscribing to three separate calendars in Google Calendar — clutter, no filtering, no
busy-masking for the feed I share. This does the merge + filter + privacy mask in one
subscribable URL with no signup. That's a real, recurring win.

## What worked (I scrutinized the merge byte-for-byte, as I always do)
- Faithful merge: england=83 VEVENTs + scotland=94 = merged 177. Exact. Zero dropped.
- 177 UIDs, all unique, all preserved verbatim (sample gov.uk UID present exactly once).
- Scotland-only events (St Andrew's Day, 20 lines) all survived the merge.
- UTF-8 fidelity: "New Year’s Day" curly apostrophe preserved identically in merged.
- Filters do exactly what they say: include "Christmas" → 20 events, all "Christmas Day".
  Exclude "bank" → 110 events, zero "bank" titles remaining. Case-insensitive as stated.
- Busy mask: all 177 SUMMARYs become "Busy", every DESCRIPTION/LOCATION line stripped
  (0 remaining), times kept. No leakage.
- THE thing that won me over: a failed source is NOT silently dropped. Pointing source 1
  at a 404 produced a visible VEVENT "iCal Blend: 1 source failed" / "Source 1 of your
  blend could not be fetched" injected into the calendar. That is the anti-invisible-
  transform behavior I demand. Huge trust signal.
- Min 2 sources enforced (single feed → no feed built, correct). Proper
  content-type: text/calendar, sane cache-control s-maxage=300.

## Friction / concerns
1. A non-ICS or unreachable URL still BUILDS a feed with no warning at create time — you
   only learn it failed by subscribing and seeing the "1 source failed" event later. I'd
   want a pre-flight validation ("Source 1 didn't return a calendar — build anyway?")
   on the Create-feed click. The failure event is great as a backstop but late.
2. The feed config is "encrypted inside the URL," but the source URLs are recoverable by
   whoever holds the link, and the link is unguessable-but-bearer. Fine for me, but I'd
   want one line clarifying that anyone with the URL gets my source list. (Verified copy
   buttons render; clipboard read blocked in test env, treated as env artifact.)
3. No event-count confirmation in the UI after build ("177 events from 2 sources") — I had
   to curl it myself to trust it. A visible count would close the trust loop for non-curl users.

## Biggest thing that would raise advocacy to 9–10
Validate sources at Create-feed time and show a live merged event count ("2 sources →
177 events, 0 dropped"). That turns my manual VEVENT-counting ritual into something the
app proves up front — and an analyst who sees that will recommend it unprompted.
