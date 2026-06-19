# Sam — Product Manager (mobile-heavy, won't debug anything)

Tested cold on a 375px mobile viewport, then completed the full flow.

## Clarity — Yes
I'd tell a friend: "Paste 2–5 calendar links, it mashes them into ONE link you subscribe to
once — and you can hand someone a version with private titles hidden." The headline "Stop
checking three calendars" plus the subhead ("Blend your work, personal, and shared calendars
into one link... hand others a version with the private titles hidden") nailed it in well
under 30s. "No account" + "Nothing is stored on the server" reassured me immediately — that's
the line I'd actually repeat. This is exactly the merged-subscribable-link thing I've wanted
for my Asana milestone + release + personal calendars.

## Value — Yes
Today I do this with nothing — I keep 3 calendars open in tabs and screenshot dates into
Notion when someone asks "when's the release?" There is no tool I use that merges feeds into
a subscribable URL. This is a real time-saver: one link, subscribe once, done. The fact that
I can label one feed "[Release]" so a shared calendar looks organized is precisely the kind
of thing that makes me look on top of it — and that's catnip for me.

## Per-feed Options + prefix (the focus)
- FOUND the Options on cold load with zero hunting: a small "Options" disclosure sits under
  every feed row. Tapped it, it expanded inline. Clean.
- Set prefix "[Release] " in the field labelled "Label added to this feed's event titles."
  After typing, the toggle relabelled to "Options · on" — great little confirmation that the
  row has customization.
- DISTINCT from global mask: confirmed. The global "Busy-only privacy mask" literally says
  "Applies to all feeds. Need it for just one? Use a feed's Options." That one sentence
  removed all the confusion I'd normally have between global vs per-feed. Per-feed options also
  carry their OWN mask + hide-all-day, so the split is obvious.
- It actually WORKS: after Create, result said "Merged 59 events from 2 sources. 1 feed
  labelled." I checked the live feed — US Holidays titles came out "[Release] New Year's Day"
  etc., and the un-optioned feed stayed plain. Real, not cosmetic.

## Copy / share
Both an https Feed URL and a webcal:// URL, each with a Copy button. Tapped Copy → button
flipped to "Copied!" and the clipboard genuinely held the feed URL (verified). "Add to Google
Calendar" link + a Preview list of upcoming events with dates means I can sanity-check before
sharing. This is share-ready, which is the whole reason I'd use it.

## Nitpicks (minor)
- The feed URL is a huge opaque token — fine functionally, but on mobile it's an intimidating
  wall of characters. A "this link IS your config, lose it and rebuild" note exists, which is
  honest but slightly nervy for a non-technical sharer.
- I'd love a tiny "share via Slack" or shortened-link nicety since sharing is my whole job,
  but copy works.

## Answers
(a) Advocacy: 9 — I'd bring this up unprompted in my next standup. It does the one thing I
    wanted, no signup, and it just worked first try on my phone. Not a 10 only because I
    haven't yet trusted it across a calendar refresh cycle and the raw token link looks scary.
(b) Value clear in <30s? YES.
(c) Biggest blocker: none that stopped me. Closest thing: the long opaque feed-URL token
    looks fragile/intimidating for sharing, but it copied fine.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Feed URL is a long opaque token that looks fragile/intimidating to share on mobile", "No share-shortcut (Slack/short link) for a share-heavy user"], "priorConcernsAddressed": "n/a"}
```
