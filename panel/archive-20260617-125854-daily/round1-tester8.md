```json
{"tester":8,"name":"Rob","clarity":"Yes","value":"Yes","advocacy":8}
```

# Rob — freelance brand/visual designer

## 30-second read
Yes, immediately got it. The h1 "iCal Blend" plus the one-liner "Merge 2–5 calendar feed
URLs into one subscribable feed — with optional keyword filters and a busy-only privacy
mask. No account, nothing stored" told me exactly what it does and that it's for people
juggling multiple calendars. "Busy-only privacy mask" is the phrase that made me lean in —
that's literally the thing I want for sharing availability with a new client.

## What I did
Pasted the two gov.uk bank-holiday ICS feeds, ticked "Busy-only privacy mask," hit Create
feed. Got a feed URL + webcal:// link, copy buttons, Google/Apple subscribe steps, and a
live preview where every row read "Busy" with the real date. Then I curl'd the feed URL.

## What worked (this is the part I care about, and it passed)
- `curl` of the merged feed: every `SUMMARY:` is `Busy` — 177 events, ZERO leaked titles.
- DESCRIPTION, LOCATION, ATTENDEE lines are fully stripped — confirmed none present.
- Dates/times preserved, so the busy blocks land correctly. Two feeds merged into one.
- No login, no upload, instant. This is the real workflow win — today I'd either share my
  Google "free/busy" link (leaks nothing but only covers ONE calendar) or manually build a
  throwaway calendar. This merges my several client feeds AND masks in one paste. That's
  genuinely faster than my "rebuild it by hand" habit.

## Friction / the one real problem
- BIG ONE: the masked feed still ships the original `UID` verbatim, e.g.
  `UID:...-NewYearsDay@gov.uk`. With real client feeds that UID would read something like
  `KickoffWithAcmeCorp@...`. SUMMARY says "Busy" but a client who opens the raw .ics (or
  whose calendar app surfaces the UID) can read my client names. For an app whose headline
  selling point is "don't leak client names," that's the gap that keeps me from a 9/10. I'd
  want UIDs rehashed/anonymized when the mask is on.
- Minor: the feed URL is enormous (encrypted config in the path). Fine, but it overflows
  the box — I trust the Copy button but couldn't eyeball it.
- Minor: no "what happens if a source feed is private/auth-required" note; my client booking
  feeds sometimes need a token. Unclear if those work.

## Biggest thing that would raise advocacy
Anonymize the UID (and any X-WR-CALNAME / PRODID echoes) when busy-only is on, so the
masked feed leaks NOTHING about source events. Fix that and I'm at 9 and recommending it in
my freelancer Slack unprompted.
