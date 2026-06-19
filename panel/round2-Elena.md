# Round 2 — Elena (Engineering manager, 8 reports, 30-sec patience, phone-first)

Tested cold on a 375px mobile viewport (my real device between meetings).

## (b) Purpose clear within 5 seconds? YES
The H1 "One feed from all your calendars — work, personal, or team" plus the subhead
"Paste 2–5 calendar links. Get one subscribable feed. No account." told me exactly what it
does and that there's no setup tax. "No account" is the line that kept me from bouncing —
anything requiring a login is dead to me. I'd tell a peer: "paste your on-call, recruiting,
and personal .ics links, get ONE link you subscribe to in Google Calendar."

## (c) Valuable to you? YES
Today I manually add 3 separate calendars to Google Calendar and they clutter my phone with
3 toggles and 3 colors. I literally want my team on-call feed + recruiting feed + personal
merged into ONE subscription. This does exactly that, client-side, no signup. The
"Busy-only privacy mask" and per-feed keyword filters mean I can share a recruiting feed
without leaking interview candidate names — that's a real win I didn't know I wanted.

## Per-feed keyword filters AND active-filter badge found COLD? YES
- Each feed row has an "Options & filters" disclosure with a greyed micro-hint
  "prefix · keyword filter · mask" — I knew filters lived there before clicking.
- Expanded: "Keywords — this feed only" with Include ("piano, soccer") / Exclude fields,
  plus a per-feed label prefix and Mask toggle. Unmistakable.
- After I set include=oncall + prefix, COLLAPSING the row showed a purple active-filter
  badge: "Options & filters · on" and "include: oncall · prefix" right under the URL. I can
  see at a glance which feeds are filtered without re-opening every row. Excellent.
- Global filter present too: "Only include events containing" / "Exclude events containing"
  with copy that points back to per-feed options. Clear division of scope.

## Flow speed
Pasted 2 URLs → Create feed → got a subscribe link in well under 30 seconds. Result panel
nails it: "Add to Google Calendar" button (one tap from my phone), a Copy button (verified:
label flips to "Copied!", URL is on the clipboard — copy verified visually, clipboard read
worked in test env), per-platform Google/Apple/Outlook steps, a "Preview — exactly what
subscribers see" block, and a security caption ("treat it like a password"). It also honestly
reported "2 sources could not be fetched — HTTP 404" for my placeholder URLs instead of
silently shipping an empty feed. Trust earned.

## What holds it back (the missing point)
- My placeholder URLs 404'd as expected, but I never saw it work with REAL events end to
  end on first try — a "Try a sample feed" / demo link would let a skeptical manager see a
  populated merge in 10 seconds before pasting her own private links.
- "Add to Google Calendar" is what I'd actually tap on mobile — it should be the loud
  primary; the raw Feed URL + Copy is secondary for me. Layout mostly does this already.
- Minor: I had to trust that the link stays live ("auto-refreshes on each refresh") — one
  line on how long the link lasts / what happens if the source rotates would seal it.

## (a) Advocacy: 8/10
I'd bring this up unprompted in my staff channel — it solves a real, recurring,
phone-friendly pain with zero setup and no signup, and the privacy mask makes it safe to
share team feeds. Not a 9 only because I haven't seen a real populated merge first-run
(a sample feed would close that), and I'd want a word on link longevity before I tell 8
reports to depend on it.

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No sample/demo feed to see a real populated merge before pasting private links", "Need one line on how long the subscribe link stays live / source rotation"], "priorConcernsAddressed": "n/a"}
```
