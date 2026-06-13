```json
{"tester":4,"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":8}
```

# Tomás — Operations analyst, Edge on corporate Windows laptop

## Clarity: Yes
Within 5 seconds I knew exactly what this is. The H1 "iCal Blend" plus the one-liner
"Merge 2–5 calendar feed URLs into one subscribable feed — with optional keyword filters
and a busy-only privacy mask. No account, nothing stored: your whole setup lives
encrypted inside the URL" told me what it does AND answered my #1 worry before I had to
ask it. That last clause is the thing that made me keep reading instead of bouncing.

## Value: Yes
Today I have my Teams/Outlook calendar and a SharePoint-hosted shift/facilities .ics, and
there is no clean way to hand a vendor a merged-but-sanitized view. I'd either screenshot
my week into Teams or manually re-key availability — slow and error-prone. This does it in
one paste. The thing that earns my trust as someone wary of random sites:
- I curled the generated feed myself. With the mask ON, all 177 events came back
  `SUMMARY:Busy`, and there were ZERO DESCRIPTION / LOCATION / ATTENDEE lines — stripping
  is real and server-side, not just a cosmetic preview. That is the proof I needed.
- Config is in the URL, no account, no stored data. For an IT-locked shop that's ideal.

## What worked
- Two-feed merge of the gov.uk England + Scotland feeds: clean, fast, HTTP 200,
  `text/calendar` content-type.
- Busy-only mask: verified end-to-end via curl (above).
- Include filter "christmas": 177 events -> 20, all titled "Christmas Day". Exact, fast.
- Bad source URL ("not-a-real-url"): blocked, stayed on the form, no broken feed shipped.
- Google/Apple subscribe instructions + webcal:// link are exactly the hand-holding a
  non-power-calendar-user needs.

## Friction / bugs (concrete)
1. PRIVACY LEAK — biggest one for MY use case. With the mask on, the SUMMARY is stripped
   but the original UID passes through verbatim, e.g.
   `UID:...-2023-12-25-ChristmasDay@gov.uk`. The event name is sitting right there in the
   UID. For a real corporate feed, UIDs often embed the meeting subject / organizer, so a
   vendor importing my "busy-only" feed could read what I tried to hide. A busy mask that
   doesn't also opaque the UID is not safe to hand to a vendor — and that hand-off is the
   entire reason I'd use this. This pulls my score down hard.
2. No "fetch failed / dead feed" reassurance — I'd want to know it actually reached my
   internal URL before I trust the output (and what happens if my SharePoint feed needs
   auth — it just silently won't appear?). Untested but it's the next question I'd have.
3. The encrypted-config-in-URL is great for privacy but the URL is enormous; pasting that
   into Outlook/Teams or a vendor email will get line-wrapped and broken. A short share
   link option would help adoption.

## Single biggest thing that would raise advocacy to 9–10
Opaque/randomize the UID (and DTSTAMP comments) when the busy-only mask is on, and say so
explicitly in the mask description ("titles, descriptions, locations, attendees AND event
identifiers are stripped"). Right now I can't in good conscience send the masked feed to a
vendor, which is the exact job I came here for.
