# Round 1 — Tomás (Operations Analyst, Excel/Tableau/Jira/Teams, Edge on locked-down Windows)

## (b) Clarity — YES
Within 5 seconds I knew exactly what this is. The H1 "One feed from all your calendars —
work, personal, or team" plus "Paste 2–5 calendar links. Get one subscribable feed. No
account." nails it. The "No account" and the bottom line "Your source URLs are encrypted
into the feed link and fetched server-side... never stored persistently" are the two phrases
that made me, a guy wary of pasting an internal feed URL into a random site, willing to keep
going. The "Busy-only privacy mask" checkbox with "descriptions, locations and attendees are
stripped" is the exact thing I came for.

## (c) Value — YES
Today I either subscribe to feeds one-by-one in Outlook/Teams (which won't merge a vendor a
single stripped link) or I'd ask IT, who'd block it. There is no Excel/Tableau workaround for
"hand a vendor a busy-only version of my work calendar." This does it in one session, no
install (IT blocks installs — browser tool is the whole appeal), no login. The merge worked:
2 holiday feeds → one .ics with a copyable URL + webcal + "Add to Google Calendar" + a
"Preview — exactly what subscribers see" pane. That preview is what closes the trust gap for me.

## Per-feed keyword fields — FOUND COLD, and they work
Yes, I found them cold. Each feed has an "Options" disclosure; opening it shows
"Keywords — this feed only / Include / Exclude" with placeholders `piano, soccer` and
`standup, lunch`, and the line "These ADD to the global keyword filters above — an event must
pass both." That sentence is what told me per-feed AND global compose. After saving, the
collapsed label reads "Options · on" so I can see at a glance which feed has filters — good.

I VERIFIED behavior, not just UI: I put 2 feeds (US + Canada holidays), set the US feed's
per-feed EXCLUDE = "Day" and the GLOBAL include = "Day", created the feed, and curled the
generated .ics. Result: every US "...Day" event was dropped, Canada "...Day" events kept —
exactly the AND composition the helper text promised. Global filter alone and per-feed alone
both fired correctly.

## Blockers / friction (minor)
- Keyword match is SUBSTRING, not word-boundary: include "Day" also kept "Holiday" (contains
  "day"). Fine once you know, but a non-power-user pasting "PM" could nuke unrelated titles.
  A one-line note ("matches anywhere in the title") would prevent foot-guns.
- The generated feed URL is plain text, not in a copy-input — there IS a "Copy" button so it's
  fine, but I couldn't grab it programmatically; minor.
- I'd want explicit reassurance that the per-feed mask hides titles for ONE feed while keeping
  others detailed — the Options copy says exactly that, so this is satisfied, noting for record.

## Scores
(a) Advocacy: 8/10. I'd bring this up unprompted to a peer who needs to share a stripped
calendar with a vendor — that's a real, recurring ops pain with no clean alternative. Not a 9
only because the substring-match gotcha and "is this REALLY safe with an internal corporate
feed URL" residual caution would make me test it once myself before recommending company-wide.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["keyword match is substring not word-boundary — 'Day' also matched 'Holiday'; no inline note warning of over-matching", "residual trust caution about pasting an internal/corporate feed URL despite the 'encrypted, not stored' line"], "priorConcernsAddressed": "n/a"}
```
