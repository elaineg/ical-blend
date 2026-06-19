# Aisha — Round 1
- Advocacy: 8/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: Copy bug "kept 408**after** filters & mask" (missing space) repeats in the hero metric of the new Preview feature; plus inconsistent source labeling (raw host "www.gov.uk" vs friendly "[Holidays]") and a mislabeled "[Personal]" football sample.

## Walkthrough (craft notes)
- Headline reads like a person wrote it: "Stop checking three calendars… hand others a version with the private titles hidden." Sub: "Paste 2–5 calendar links. Preview & test them, then get one feed. No account." Tight, considered. I knew what this was in ~10s.
- "LOAD A SAMPLE FEED" as a quiet small-caps link = nice restraint, but tapping it only FILLS the two URL fields; it does NOT auto-preview. The page LEADS with "Preview & test," so a cold sample should instantly show the merge. The "Add a feed URL to preview" helper just vanished. Empty→populated is functional, not delightful. Minor.
- Preview is the star: per-source STATUS rows with ✓, "[Holidays] — 83 events fetched / [Personal] — 325 events fetched," then the kept-vs-fetched line. Honest, legible counts — love that it's explicit.
- CRAFT MISS: that line renders "408after" — no space before "after." It's the hero number of the whole new feature and it reads broken. As a designer this is exactly the kind of thing that makes me distrust the rest of the polish.
- LABEL INCONSISTENCY: the sample shows friendly "[Holidays]/[Personal]" prefixes, but when I typed my own URLs the prefix fell back to the raw host "www.gov.uk." Also the football fixtures feed is mislabeled "[Personal]" in the demo — wrong mental model for a sample.
- Bad-URL error STATE is genuinely well done: red ✗ + "fetch failed" inline, calm note "1 source failed — its events are not included," and it even injects an "iCal Blend: 1 source failed" event into the feed so subscribers notice. Honest, not scary — the best-crafted state in the app.
- Create feed → clean result: https + webcal links w/ Copy, "Add to Google Calendar," per-app subscribe steps (Google/Apple/Outlook), "treat it like a password" security line, a real "exactly what subscribers see" preview, and a device-local "Your recent blends" list. Thorough. (Copy verified visually; clipboard read blocked in test env.)
- Calm, even spacing/typography; zero console errors through every flow.

## Answers
1. CLARITY: Yes. I'd tell a friend: "Paste your work, personal, and the kids'-school calendars; it merges them into one link you subscribe to once — and you can hand someone a version where private titles just say 'Busy.'" Headline + sub nailed it cold.
2. VALUE: Yes. Today I hand-overlay a personal cal, my partner's shared cal, and a school ICS and constantly miss things; Google's native subscribe is fiddly and gives no preview. This previews the actual merged output before I commit and masks private titles — exactly my family-feed job, no account.
3. ADVOCACY: 8. Real, considered, solves my exact pain, and the error state shows someone cared. Held back from 9–10 by the "408after" missing space in the hero metric, the host-vs-friendly label inconsistency, and the mislabeled "[Personal]" sample — small, but they're the craft tells I notice first and they'd make me hesitate before recommending it loudly. Fix spacing + label consistency and this is a 9.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["count line renders '408after filters & mask' — missing space in the new Preview feature's hero metric", "source-label inconsistency: typed feeds show raw host 'www.gov.uk' vs friendly '[Holidays]'; sample mislabels a football feed '[Personal]'"], "priorConcernsAddressed": "n/a"}
```
