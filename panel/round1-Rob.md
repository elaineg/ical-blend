# Rob — Brand/visual designer, freelance (round 1)

Tested cold on desktop, 1280px. Used two real holiday ICS feeds as stand-ins for two client booking feeds.

## Clarity — Yes
Within 30s I'd tell a friend: "Paste 2–5 calendar links, get one subscribe-once feed URL — and you can hand a client a version with your private titles hidden." The H1 "Stop checking three calendars" plus the subhead ("Blend your work, personal, and shared calendars into one link ... and hand others a version with the private titles hidden") nailed both the merge job AND my privacy job immediately. "Source feeds (ICS / webcal URLs)" and "Busy-only privacy mask" with its plain-English explanation ("Every event title becomes 'Busy'; descriptions, locations and attendees are stripped. Times are kept.") left zero ambiguity. Nothing confused me on the cold load.

## Value — Yes
Today I do this by hand: when a new client asks "when are you free?", I screenshot my calendar and manually scrub out the other client names in Photoshop, or I rebuild a fake "availability" calendar — 10–15 min of grunt work every time, and it goes stale the next day. This gives me a LIVE subscribe-once link that auto-strips titles. That's not a 4-minutes-in-Photoshop task I can beat manually — a static screenshot can't stay current. The per-feed mask is the killer: I can mask ONLY the client feed to "Busy" while keeping my own feed labelled, so I share availability without leaking client names AND still read it myself. Verified at the raw feed: the masked feed emitted only `SUMMARY:Busy` (zero leakage, descriptions/locations gone for that feed), the other kept `[CA] ...` titles. That's genuinely better than my current habit.

## The 4 focus points
- Per-feed Options on cold load: FOUND instantly. Every row has a "▸ Options" disclosure right under it, collapsed by default. Clean, not noisy. After I set something it relabels to "Options · on" — smart, I can see which feeds are customized without expanding them.
- Per-feed mask vs global mask — clearly DISTINCT and well-disambiguated. Per-feed: "Mask this feed's titles / Show this feed's events as 'Busy', keeping other feeds detailed." Global: "Applies to all feeds. Need it for just one? Use a feed's Options." That last line is a great cross-link — it told me exactly which one fits my "mask just the client feed" need. The per-feed mask fits my use case better and the copy made that choice obvious.
- Prefix: set "[CA] " on feed 2, created feed, preview showed "[CA] Canada Day" correctly.
- Copy cue: FIRED. Button label flipped "Copy" → "Copied!" and clipboard actually held the feed URL. Both Feed URL and webcal:// have their own Copy button. Works.

No breakage, no console errors. Result panel summary "Merged 59 events from 2 sources. 1 feed labelled. 1 feed masked." is a confidence-builder — it confirms the masking took.

## Nits (not blockers)
- The feed URL is a giant opaque token. The note "Nothing is stored ... the feed URL itself carries your encrypted configuration. Lose the URL? Just build a new one." reassured me, but as someone handing this to a client I'd want a way to NAME/label a saved link so I don't lose track of which monster-URL went to which client. Right now it's fire-and-forget.
- Minor: as a visual guy, the result panel is functional-plain. Fine, but a designer would expect slightly more polish on the one screen I'd screenshot for a client.

## Answers
(a) Advocacy: 8/10 — I'd recommend this to other freelancers unprompted the next time availability-sharing comes up. Not a 9 only because the un-nameable opaque URL makes me nervous about handing distinct links to multiple clients and tracking them.
(b) Value clear in <30s? Yes.
(c) Single biggest blocker: none that breaks the flow — the closest thing is the unmanageable opaque feed URL with no way to label/recall which link you gave to which client.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Opaque un-nameable feed URL — no way to label/track which link went to which client", "Result panel is visually plain for a screen I'd share with a client"], "priorConcernsAddressed": "n/a"}
```
