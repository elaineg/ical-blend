# Tomás — Operations Analyst (Excel/Tableau/Jira/Teams, Edge on locked-down Windows laptop)

Round 1. Tested live in browser at 1366px. My job: merge my Teams/Outlook work feed with a
shared facilities/shift feed, and hand a vendor a *stripped* version of the sensitive one.

## What I did
Added US Holidays (masked) + a second holiday feed (prefix "[CA] ", left readable), opened
the per-feed Options, created the merged feed, read the preview, copied the URL, and
fetched the raw .ics to see what a vendor would actually receive.

## Clarity — YES
I'd tell a friend: "Paste 2–5 calendar links, get back one feed URL you subscribe to once —
and you can hand someone else a copy with the private titles blanked to 'Busy'." The H1
"Stop checking three calendars" + the subhead "hand others a version with the private
titles hidden" nailed my use case in well under 30 seconds. The footer line "Nothing is
stored on the server — the feed URL itself carries your encrypted configuration" is exactly
the reassurance a data-wary person like me looks for, and it's plausible (the URL is a long
opaque blob). Good.

## Value — YES
Today I do this by hand: I keep my Outlook calendar and a shared SharePoint/Teams facilities
list side by side and eyeball them, or beg IT for a combined view. There is NO clean way to
give a vendor a redacted feed — I'd manually rebuild a stripped calendar in Excel and export
it, which I won't do weekly. This collapses that into one paste. The killer detail: I masked
ONLY the US feed and it shows "Busy" in the preview, while the other feed shows "[CA] Canada
Day" fully readable, with the summary correctly stating "1 feed labelled. 1 feed masked." I
pulled the raw .ics myself: masked events are scrubbed to bare `SUMMARY:Busy`, no
DESCRIPTION/LOCATION, even a fresh anonymized UID — the readable feed keeps its detail. That
is precisely the per-feed split I need, and it's genuinely DISTINCT from the global "Busy-only
privacy mask" (which the UI even cross-references: "Applies to all feeds. Need it for just
one? Use a feed's Options."). That one sentence is what made the two non-confusing.

## Things that worked well
- Per-feed Options were findable on cold load (a small "Options" toggle under every row).
- After I set one, the toggle relabels to "Options · on" — clear cue something's configured.
- "Copy" → "Copied!" fired and the clipboard genuinely held the feed URL. Verified.
- When my second feed (a Google ICS) got rate-limited (HTTP 429 on Google's side, not the
  app), it degraded gracefully: built the feed anyway and said "Source could not be fetched
  ... will retry each refresh." That's the right behavior; an ops person trusts that.

## Advocacy — 8/10
I'd recommend it to colleagues who juggle work + shared calendars, and I'd bring up the
per-feed mask specifically to anyone dealing with vendors. Not a 9 because: (1) "Create feed"
sat on "Creating…" for several seconds while it fetched live feeds, with no progress hint —
on a slow corporate VPN I'd wonder if it hung. (2) The big trust question for MY scenario is
unanswered on-page: when I paste my real internal Outlook/Teams feed URL, does the server
ever log or persist that source URL? "Nothing is stored" reassures about the *output* config,
but I want one explicit line that the source URLs and their fetched contents aren't logged —
that's the difference between me trying it and me actually pasting an internal feed.

(a) Advocacy: 8/10
(b) Value clear in <30s: YES
(c) Biggest blocker: no explicit promise that my *pasted source feed URL* isn't logged/stored
    server-side — for a vendor handoff with an internal feed, that's the one fear that stops me.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No explicit guarantee that pasted SOURCE feed URLs aren't logged/stored server-side — key fear for handing a vendor an internal feed", "'Creating…' hangs several seconds with no progress indicator; on a slow VPN it looks broken"], "priorConcernsAddressed": "n/a"}
```
