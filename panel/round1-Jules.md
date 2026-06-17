# Jules — Content & community marketer (medium tech, 50/50 desktop+mobile)

My job: I subscribe to a pile of community-event ICS feeds (Discord events, Luma, a newsletter cal) and I want them merged + keyword-filtered into one. And I will NOT make an account for a 2-minute job.

## Clarity — Yes
I'd tell a friend: "Paste your calendar feed links, it spits out one feed URL you subscribe to, and you can hide the private titles." The headline "Stop checking three calendars" + the subline naming work/personal/shared and "one link you subscribe to once" told me exactly what it is in ~10 seconds. "No account" right in the subline is the line that made me actually try it — that's my whole buying criterion. Nothing confused me on the landing.

## Value — Yes
Today I do this manually: keep 4 feeds subscribed separately in Google Calendar and eyeball them, and there is NO good free no-login way to keyword-filter or merge them. Calendar apps don't let me say "only events containing X" or relabel one feed. This nails it: I added US Holidays + Canada Holidays, expanded **Options** on feed 1 and set prefix `[Community] `, ticked **Mask this feed's titles** on feed 2, AND set a global include filter "Day". Result banner read: *"Merged 53 events from 2 sources. Only events matching 'Day'. 1 feed labelled. 1 feed masked."* The preview list then literally showed `[Community] Independence Day Holiday`, `[Community] Labor Day`... next to plain `Busy` rows from the masked feed. That receipt — telling me what it did — is exactly what I want when I'm juggling platform quirks. It saved me real effort over my status quo (which is "give up and check three tabs").

## Per-feed Options findability & mask distinction
- **Found it instantly on cold load**, desktop AND mobile (375px) — every row shows a "Options" disclosure under it, default collapsed. Expanded panel is clearly labeled: "Label added to this feed's event titles", "Mask this feed's titles → Show this feed's events as 'Busy', keeping other feeds detailed", "Hide all-day events from this feed". Once I set something the toggle relabels to **"Options · on"** — great at-a-glance cue for which feeds have rules.
- **Per-feed vs global mask = clearly distinct.** The global "Busy-only privacy mask" literally says *"Applies to all feeds. Need it for just one? Use a feed's Options."* That one sentence killed any confusion. Per-feed mask says "keeping other feeds detailed." Nicely done.
- Copy cue **fired**: button "Copy" → "Copied!" and the clipboard genuinely held the feed URL. Both an https Feed URL and a webcal:// link given, plus an "Add to Google Calendar" button and Apple instructions — covers how I'd actually subscribe.
- No console errors, no breakage anywhere.

## Nits (not blockers)
- The generated feed URL is a giant opaque token (~200 chars). I trust "nothing stored" but it's intimidatingly long; a marketer pasting that into Slack will get an ugly wrap. Minor.
- I'd have loved a tiny "what does this look like to the person I share it with?" preview toggle, but the masked rows in the live preview basically already show it.

## Answers
(a) Advocacy: **8/10** — I'd recommend it to my community-ops friends who hate the "three calendar tabs" life, and the no-login + per-feed mask is genuinely better than anything free I know. Not a 9 only because my real feeds are Discord/Luma webcal links and I haven't proven those exotic feeds parse here (holidays feeds are easy mode), and the monster URL gives a faint "is this really safe to paste publicly?" hesitation.
(b) Value clear in <30s? **Yes.**
(c) Single biggest blocker: **None blocking.** Closest thing: the ~200-char opaque feed URL feels unwieldy/slightly sketchy to hand to a teammate — a shorten or a one-line "this link is self-contained, safe to share read-only" reassurance would push me to 9.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["~200-char opaque feed URL feels unwieldy/slightly sketchy to share with a teammate", "Only tested easy holiday feeds; unsure my real Discord/Luma webcal feeds parse"], "priorConcernsAddressed": "n/a"}
```
