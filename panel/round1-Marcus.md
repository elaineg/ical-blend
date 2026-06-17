# Marcus — Frontend engineer, 2yr (desktop Chrome, devtools open)

Cold open: landed on "Stop checking three calendars" + "Paste 2–5 calendar links. Get one feed. No account."
Instant. I got it in ~5 seconds. This is exactly the thing I'd drop in team Slack.

## Clarity — Yes
I'd tell a friend: "Paste your GitHub sprint ICS, your Google Calendar, and your meetup feed,
it spits out ONE subscribe URL — free, no login, and you can hand someone a version with private
titles hidden." The H1 + subhead carry it. "Source feeds (ICS / webcal URLs)" is correctly precise
for my audience. Nothing confused me.

## Value — Yes
Today I manually subscribe to 3 separate ICS URLs in Google Calendar and live with the noise
(every holiday + all-day junk clutters my day view). My only "filter" is muting calendars wholesale.
This does what I actually want: I expanded a feed's **Options**, set a title PREFIX `[US] ` (it
rendered `[US] Juneteenth`, `[US] Independence Day`... in the live preview — confirmed working), and
the per-feed "Hide all-day events from this feed" + per-feed "Mask this feed's titles" are exactly the
granularity I was missing. Summary line "1 feed labelled · 1 feed masked" is a great honest receipt.
The no-server / URL-carries-config model is the kicker — nothing to trust, nothing stored.

## Per-feed Options findings (the ask)
- FINDABLE on cold load: yes. Every row shows a collapsed "Options" disclosure right under the URL
  field. Not buried. When a row has active rules the toggle reads "Options · on" — clean affordance.
- Per-feed mask vs GLOBAL "Busy-only privacy mask": clearly DISTINCT. Per-feed copy says "Show this
  feed's events as 'Busy', keeping other feeds detailed." Global copy says "Applies to all feeds.
  Need it for just one? Use a feed's Options." That cross-reference is genuinely well thought out —
  no ambiguity.
- Copy cue: FIRED. Button flips to "Copied!" and the URL did land on the clipboard (verified).
- CSS jank: none I'd flag. Spacing/typography consistent, monospace feed URL, tidy green success +
  amber warning panels. Caret rotates on expand. Ships.

## Honest gripes (what holds it back)
1. One of my two real feeds (UK Google Holidays) came back "Source 2 could not be fetched." I checked:
   that feed is returning HTTP 429 (Google rate-limiting), so it's not the app's bug — BUT the app just
   says "could not be fetched... will retry." It doesn't tell me WHY (timeout? blocked? rate-limited?),
   so as a builder I can't tell a transient 429 from a dead URL. A status code / reason would save me
   a devtools trip.
2. The feed URL is a huge opaque base64 blob. Makes sense (config-in-URL, no storage), but it's
   visually alarming and un-shareable in chat without the Copy button. Fine, just noting.

(a) Advocacy: **8/10**. I'd share this in team Slack tomorrow — "free, no signup, merges + filters ICS
per-feed." Not a 9 only because the opaque fetch-failure message made me briefly doubt it worked, and
I'd want to confirm a GitHub/webcal:// feed round-trips before vouching to the whole team.
(b) Value clear in <30s: **yes**.
(c) Biggest blocker: the silent/vague per-source fetch failure ("could not be fetched" with no reason
code) — for a feed that's actually being rate-limited it reads like the app broke.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["per-source fetch failure shows no reason/status code — a rate-limited (429) feed reads like the app is broken", "feed URL is a huge opaque base64 blob, only shareable via the Copy button"], "priorConcernsAddressed": "n/a"}
```
