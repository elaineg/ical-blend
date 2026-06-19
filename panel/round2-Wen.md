# Round 2 — Wen (Marketing data analyst)

**Advocacy: 8/10 · Clarity: Yes · Value: Yes**
Found per-feed keyword filters AND active-filter badge cold: **YES**

## Cold open (30s)
H1 "One feed from all your calendars — work, personal, or team" + subhead "Paste 2–5
calendar links. Get one subscribable feed. No account." told me exactly what it is and
who it's for in under 5 seconds. I'd tell a peer: "paste your campaign-calendar ICS, your
dbt-run ICS, and personal, get one webcal link to subscribe — free, no login, with
per-feed filtering." The form was visible above the fold; nothing made me guess.

## Per-feed filters + badge (the thing I was told to scrutinize)
- Each source row has a collapsed **"Options & filters · prefix · keyword filter · mask"**
  micro-hint. Expanding feed 1 gave: prefix label, Mask-this-feed-as-Busy, Hide all-day,
  and **per-feed Include/Exclude keywords** with the killer clarity line: *"These ADD to the
  global keyword filters above — an event must pass both."* That AND-semantics note is
  exactly what stops me distrusting a filter tool.
- After I set prefix "Campaign" + include "day" and collapsed, the row showed a visible
  pill **"Options & filters · on"** and a second pill **"include: day · prefix"**. Active
  state is legible without re-expanding. Found cold, no hunting.
- Global "Only include / Exclude events containing" present, with hint pointing to per-feed
  options for different keywords. Clean separation of global vs per-feed.

## Data fidelity audit (I curled the ACTUAL served .ics, not just the preview)
This is where most merge tools lose my trust. They didn't:
- Served feed = **467 VEVENTs; 467 unique UIDs (zero dupes/collisions)** across 2 merged
  feeds; **467 DTSTART present (no date-stripped events)**.
- **Every served event matches the "day" include filter** — the preview's 10-item sample
  and the real .ics are consistent; no invisible "show filtered in UI, ship unfiltered to
  the calendar app" betrayal.
- **Per-feed prefix correctly scoped**: 259 events labelled "Campaign" (US feed only), 208
  unlabelled (UK feed). No cross-feed contamination.
- Caption is honest about transforms: "467 events from 2 sources at blend time… Only events
  matching 'day'. 1 feed labelled." Preview header literally says *"exactly what subscribers
  see — masks, labels, and filters are already applied below — this is the real output."*

## What holds it back from 9–10
1. **No raw event count BEFORE filtering.** I see "467 at blend time (post-filter)" but not
   "X fetched → Y kept." As an analyst auditing fidelity, I want the drop count to confirm
   nothing was silently lost vs. excluded by my own filter. Right now I had to curl + grep
   to prove zero drops; a "fetched 600, 467 passed your filters" line would earn the 9.
2. **No per-source fetch status.** If feed 2's URL 404'd, would the merge silently ship only
   feed 1, or warn me? I couldn't tell from the success path. Marketers hand me dead Luma
   links weekly; I need a visible "feed 2 failed to fetch" rather than a quiet partial merge.
3. Opaque encrypted blob URL is fine for privacy, but the "treat it like a password" warning
   plus "URLs transit the server" is a small enterprise-policy speed bump I'd flag to IT.

Everything I was suspicious of (invisible transforms, dropped events, mislabelled feeds)
held up under a real curl+grep audit. That's why it's a genuine 8, not a polite 7.

```json
{"tester": 0, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No fetched-vs-kept drop count to prove zero silent event loss", "No per-source fetch-success/failure status — partial merge could ship silently"], "priorConcernsAddressed": "n/a"}
```
