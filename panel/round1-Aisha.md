# Aisha — Product designer (Figma/FigJam/Notion/Loom/Maze) — Round 1

I judge craft hard: spacing, copy tone, empty states. A clumsy flow loses me regardless of utility.

## Clarity — YES
I'd tell a friend: "Paste 2–5 calendar links, get back ONE link you subscribe to — so you stop
flipping between three calendars." The H1 "Stop checking three calendars" plus the subhead
"Paste 2–5 calendar links. Get one feed. No account." nailed it in well under 30s. The
"No account" / "Nothing is stored on the server" lines did the trust work without me asking.
Tone is plain and confident, not cutesy. Good.

## Value — YES
Today I do this manually: I keep my personal Google Calendar, my partner's shared cal, and the
kids'-school ICS as three separate subscriptions in Apple Calendar and just eyeball all three.
There's no merge — and certainly no way to relabel or hide one feed's titles. This collapses it
to one URL AND lets me prefix the school feed "[School]" while masking the partner feed to "Busy."
That second part is genuinely something my current setup can't do at all. Real, recurring, saves effort.

## Craft notes (the part I care about)
- Per-feed **Options** disclosure: I found it instantly on cold load — every row carries its own
  "Options" affordance, default collapsed, with the disclosure triangle. Reads CONSIDERED, not
  bolted-on. Expanded, it's a tinted card with proper grouping: "Label added to this feed's event
  titles" (placeholder `[Work]`), "Mask this feed's titles", "Hide all-day events from this feed",
  each with a real helper line. Spacing and hierarchy are clean.
- Per-feed mask vs global mask: clearly DISTINCT. Per-feed helper says "Show this feed's events as
  'Busy', keeping OTHER feeds detailed"; the global "Busy-only privacy mask" even cross-references
  it — "Applies to all feeds. Need it for just one? Use a feed's Options." That sentence is the
  kind of considered copy I advocate for. Nice.
- Flow worked end to end: `[School]` prefix landed on the US-holiday events, the Canada feed
  rendered as "Busy" in the live preview. Summary is honest: "Merged 59 events from 2 sources.
  1 feed labelled. 1 feed masked." Two URL variants (https + webcal), per-app subscribe steps.
- Copy cue: FIRES. Button flips "Copy"→"Copied!" AND a green "Copied to clipboard" line appears.
  Clipboard genuinely held the feed URL (verified, not blocked). Zero console errors anywhere.

## Nits keeping it off a 9
- Masked feeds collapse to bare "Busy" with no per-feed tag, so in the preview I see several
  identical "Busy" rows (e.g. two on Sep 7) and can't tell WHICH masked feed they came from.
  A masked feed should still accept/keep its prefix so I get "[Partner] Busy". Right now masking
  silently overrides the label.
- The label field is titled "Label added to this feed's event titles" but the global mask copy and
  the summary call the same thing "labelled" — fine — yet the placeholder `[Work]` with a trailing
  space is a hidden detail; I didn't know whether to add my own trailing space. A hint ("we add the
  space for you") would remove the guess.
- Long feed URL is visually truncated in the field with no "this is long, just copy it" reassurance
  — minor, the Copy button covers it.

(a) Advocacy: **8/10** — I'd recommend it to my parents'-group chat and design friends unprompted.
Held back from 9 only by the masked-feed-loses-its-label gap, which matters for MY exact use case.
(b) Value clear in <30s: **YES**
(c) Biggest blocker: masking a feed silently discards its prefix/label, so multiple masked feeds
become indistinguishable "Busy" rows — I lose the ability to tell partner-vs-school apart.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Masking a feed discards its prefix, so multiple masked feeds show as identical untagged 'Busy' rows", "[Work] placeholder's trailing space is a hidden guess — no hint about whether the app adds the separator"], "priorConcernsAddressed": "n/a"}
```
