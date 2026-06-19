# Sam — Round 2 (re-test)

Tested cold at 375px, my between-meetings phone reality. I was a 9 in round 1.

## Re-check of MY round-1 concerns
- "Scrolled past the form before trusting Preview existed" → FIXED in practice: at 375px,
  "LOAD A SAMPLE FEED" sits directly under the headline, ABOVE the source inputs. No scroll
  needed to find proof it works.
- "Couldn't confirm Copy actually grabbed the URL" → CONFIRMED FIXED: clicked Copy, label
  flipped "Copy" → "Copied!", and the clipboard genuinely held the feed URL. Last round that
  was blocked in my env; this round it round-tripped. That was the half-point holding me back.
- "Wanted to watch the link land in Google Calendar" → still can't drive Google's own UI from
  here, but webcal:// + "Add to Google Calendar" + the feed URL all generate correctly.
Prior concerns addressed: all (the two testable in-env).

## Feature focus — the 3 things I was asked to confirm
1. ONE-CLICK SAMPLE → POPULATED PREVIEW: YES. One tap on "Load a sample feed" dropped in two
   real URLs (gov.uk holidays + Chelsea fixtures) AND auto-ran the preview — no second click.
   Per-source status, count line, and the 15-event list all appeared from a single tap. It
   just worked, zero debugging. This is the "I need this" moment.
2. RECONCILIATION COUNT + SPACING: "Fetched 408 events → kept 408 after filters & mask" reads
   correctly — spacing around the arrow and "filters & mask" is clean. ONE cosmetic nit: the
   per-source lines render "[Holidays]— 83 events fetched" with the em-dash flush against the
   bracket (no space). Only sloppy pixel on screen; not a blocker.
3. MOBILE 375px / SHAREABLE LINK OBVIOUS: YES. Clean single column, good tap targets, no
   horizontal scroll, 0 console errors across the whole flow. The "Your merged feed" block
   gives a prominent feed URL + Copy, "Add to Google Calendar", and Subscribe-in
   Google/Apple/Outlook — the link to share is unmistakable.

## Answers
1. GUT (first 30s): It just works, and yes I'd share the link.
2. TOP BLOCKER: None that stops me. Two small frictions for a PM who lives in Slack/Notion:
   (a) the feed URL is a ~180-char opaque token — pasting that monster into a channel looks
   alarming, not organized, which is literally my motivation; a short/branded link would seal
   a 10. (b) "treat it like a password" + "source URLs transit the server" is honest but gives
   me a beat of pause before sharing a client calendar. Neither is a debug-it problem.
3. Clarity 10, Value 9, Advocacy 9. Holding at 9, not bumping to 10: the Copy fix removed my
   last in-env doubt, but the ugly long share URL is the one thing I'd actually grumble about
   to the teammate I hand it to — and "looks organized" is the whole job for me. Still a
   genuine unprompted recommend.

```json
{"tester": 8, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["feed URL is a ~180-char opaque token — not a clean link I'd happily paste into Slack/Notion", "per-source status '[Holidays]— 83 events fetched' missing a space before the em-dash (cosmetic)"], "priorConcernsAddressed": "all"}
```

Sam — adv:9 clarity:10 value:9 — top blocker: the ~180-char opaque feed URL looks alarming to paste into Slack/Notion (a short/branded link would make it a 10).
