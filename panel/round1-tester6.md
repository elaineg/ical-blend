```json
{"tester":6,"name":"Jules","clarity":"Yes","value":"Yes","advocacy":8}
```

# Jules (content & community marketer, 50/50 desktop+mobile)

**Clarity — Yes.** The h1 "iCal Blend" plus the subhead "Merge 2–5 calendar feed URLs
into one subscribable feed — with optional keyword filters and a busy-only privacy mask.
No account, nothing stored" told me exactly what it is in well under 5 seconds. "No
account" is the phrase that made me stay — that's my whole problem with these tools.

**Value — Yes.** Today I keep three community ICS feeds (Discord events, Luma, a
newsletter calendar) as three separate subscriptions in my calendar, and there's no way
to keyword-filter them — I see every event whether or not it's relevant to my communities.
This does the exact merge + filter I've been wanting, and it does it without a login. That
is a real recurring annoyance for me, gone.

## What worked (verified, not assumed)
- Pasted both gov.uk bank-holiday ICS feeds, added include keyword "Christmas", hit
  Create feed. Got a feed URL + webcal:// + Copy buttons + Google/Apple subscribe
  instructions. Preview pane showed only "Christmas Day" events. Good.
- Curled the served feed: HTTP 200, `content-type: text/calendar`, 20 VEVENTs, ALL of
  them `SUMMARY:Christmas Day`. Include filter genuinely works end-to-end.
- Built a second feed with EXCLUDE "Christmas": served feed had 157 events, ZERO Christmas.
  Exclude genuinely works too.
- No login, no cookie wall, no email gate anywhere. Feed URL returns 200 with no auth
  redirect. This is the thing I care about most and it delivered.
- Zero console errors. webcal:// link generated correctly for Apple Calendar.

## Friction / confusion
- DUPLICATES: the preview (and the served feed) shows "Christmas Day Fri Dec 25" twice in
  a row, because England and Scotland both carry it and there's no dedupe. Merging
  overlapping community feeds is literally my use case, so I'd end up with double entries
  for any event two sources both list. Real concern, not cosmetic.
- The feed token is a 170-char monster. Fine technically (config is in the URL, that's the
  no-storage tradeoff), but it's ugly to paste on mobile and I can't tell at a glance which
  feed is which if I make several. A short nickname or label would help.
- Single keyword only per box — I'd want "music OR meetup OR workshop". I typed one word
  and wondered if commas would OR them; the helper text doesn't say. Minor.
- "Lose the URL? Just build a new one" is honest but slightly scary — if I lose it I lose
  my config with no recovery. For a no-account tool that's an acceptable trade, just noted.

## Biggest thing that would raise advocacy (8 → 9/10)
Dedupe identical events across merged feeds (same title + same start). That's the one gap
between "neat" and "I'd bring this up unprompted in my marketing Discord," because overlap
is the default state of community calendars, not the exception. Multi-keyword (comma = OR)
would be the close runner-up.
