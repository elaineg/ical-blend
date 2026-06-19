# Round 1 — Sam (PM, mobile-heavy, medium tech, won't debug)

Cold open on phone (375px). Task: merge two real holiday .ics feeds into one subscribable
link, try per-feed keyword filters AND global keyword filters.

## (a) Advocacy: 8/10
I'd bring this up in my team's #tools channel. It nailed the exact thing I want: paste a few
links, get ONE subscribe URL + an "Add to Google Calendar" button, no signup. I merged two
feeds, copied the URL (copy button worked, gave me the full link), and the feed served fine.
Not a 9 because (1) it's calendar-only — my real dream is blending my Asana milestone feed +
a release calendar, and Asana doesn't hand out a clean .ics for milestones, so I'd still be
stuck on the input side, not this app's fault but it caps my excitement; (2) the on-screen
"Feed URL" text looked shorter than the actual link — I'd have trusted a copy that the
displayed string is the whole thing, and a paranoid PM notices that. (3) No "what happens if
a source feed dies" reassurance up front.

## (b) Clarity within 5s: Yes
Headline "One feed from all your calendars — work, personal, or team" + subtext "Paste 2–5
calendar links. Get one subscribable feed. No account." told me exactly what it is and that
it's free/no-login. I'd tell a friend: "paste your calendar links, it spits out one feed URL
you subscribe to once." The "Hide private titles from shared versions with one checkbox" line
was a nice bonus I understood instantly.

## (c) Value: Yes
Today I manually subscribe to 3–4 ICS links separately in Google Calendar and there's no
single shareable merged link — if I send a teammate "my calendars" I send a mess. This makes
ONE link I can drop in Notion/Slack and look organized, which is literally my motivation. The
privacy mask ("Busy") is a real unlock for sharing a personal calendar with work people.

## Per-feed keyword fields — found them COLD? Yes, easily.
Each feed has a "▸ Options" disclosure right under it. I clicked it without instruction and
found a clearly-titled "Keywords — this feed only" block with Include (`piano, soccer`) and
Exclude (`standup, lunch`) fields, plus the line "These ADD to the global keyword filters
above — an event must pass both." The global "Only include / Exclude events containing"
fields sit below the feeds and even cross-reference: "Want different keywords per feed? Use
that feed's Options." That cross-linking is what made it discoverable — A+ wayfinding.

VERIFIED it actually works (I won't debug, but I did sanity-check as a user): single feed =
34 events; per-feed Include="Day" dropped it to 32 and every remaining title contained "day".
Global Exclude="Observed" left 2 "Observed" hits — but those were in DESCRIPTIONS, not
titles, and the helper text plainly says keywords match TITLES, so that's correct, not a bug.
Feed URL returns HTTP 200, no console errors anywhere.

## Top friction
- Displayed "Feed URL" string appears truncated vs the real (long) token — erodes trust that
  a manual copy grabbed the whole thing. The Copy button does grab the full URL.
- Calendar-only inputs; my actual milestone/release feeds (Asana/Amplitude) aren't clean ICS,
  so the "merge everything I care about" promise stops at calendars.

```json
{"tester": 0, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Displayed Feed URL text looks truncated vs the real long token — trust hit on manual copy", "Calendar-only: my Asana milestone / release feeds aren't clean ICS so I can't actually merge them"], "priorConcernsAddressed": "n/a"}
```
