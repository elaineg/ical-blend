# iCal Blend — Round 4 (Rob, freelance brand/visual designer)

## Round-3 blocker re-check (the ONE thing I flagged)
R3 blocker: no on-screen preview of a masked feed before copying — I couldn't see what
subscribers would actually receive, which is a dealbreaker since the whole reason I mask is
to hide client names before handing a link to a NEW client.

**FIXED. Cleanly.** After "Create feed" there's now a card headed **"Preview — exactly what
subscribers see"** with a sub-label: "Masks, labels, and filters are already applied below —
this is the real output." It sits ABOVE/below the URLs but on the same result screen, so I
read it BEFORE I touch the Copy button. That's precisely what I wanted.

## What I did
Added both real feeds. Set per-feed prefixes via each feed's Options: US = `[ClientA]`,
Canada = `[CA-Hols]`. Checked "Mask this feed's titles" on the US (ClientA) feed only.
Created the blend.

## What the preview showed for the MASKED feed
Every US event rendered as **`[ClientA] Busy`** with just a date — e.g. Fri Jun 19, Fri Jul 3,
Sat Jul 4, Mon Sep 7, Mon Oct 12. The real holiday names (Independence Day, Memorial Day,
Labor Day, etc.) are GONE.
The unmasked Canada feed correctly kept titles: `[CA-Hols] Canada Day`, `[CA-Hols] Labour Day`,
`[CA-Hols] Truth and Reconciliation Day`, `[CA-Hols] Thanksgiving Day`.
Header confirms "2 sources · 2 feeds labelled · 1 feed masked." Zero console errors.

**Did titles leak? No.** Not a single masked title bled through. The label stays (good — I
want the client to know which slot is "mine") but the event name is fully suppressed to "Busy".
I would genuinely trust this before sharing with a client now. That trust is the whole game,
and the preview is what earns it — "free, no signup, and I can SEE the mask working" is the
moment I'd recommend it.

## Movement round3 → round4
R3 advocacy 6 (blocked: couldn't verify the mask, so I wouldn't dare share it) → **R4: 9.**
The blocker is gone and the implementation is honest — it shows the actual merged output, not
a fake mockup, and it surfaces it for free with no account. Big jump.

## Answers
(a) **Advocacy: 9/10.** I'd bring this up unprompted to other freelancers sharing availability.
Held back from 10 only by the privacy nuance in the URL note ("URLs do transit the server") —
fine for me, but a security-twitchy client might ask, so it's not a blind 10.
(b) **Value clear in <30s? Yes.** "Stop checking three calendars" + "hand others a version
with the private titles hidden" nailed my exact job. Beats my old workflow (manually scrubbing
an exported ICS in a text editor, ~10 min and error-prone) easily.
(c) **Biggest remaining blocker: None that blocks me.** Minor nit: the preview list isn't
labeled as truncated/sorted, so I briefly wondered if it showed ALL events or a sample — a
"showing next 10 of 65" line would close the last 1% of doubt.

```json
{"tester": 7, "round": 4, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["preview list not labeled as a sample vs full output (showed 10, feed has 65)", "URL note admits source URLs transit the server — a cautious client might balk"], "priorConcernsAddressed": "all"}
```
