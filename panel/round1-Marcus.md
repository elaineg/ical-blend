# Marcus — Round 1
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: none (one cosmetic CSS bug: missing space in "kept 375after filters & mask")

## Walkthrough
Cold load: headline "blend your work, personal, and shared calendars into one link you subscribe
to once" + "Paste 2–5 calendar links. Preview & test them, then get one feed. No account." — I knew
the job in ~5s. "LOAD A SAMPLE FEED" is the first action and "PREVIEW MERGED CALENDAR" sits above
the fold, so I found the preview flow cold without hunting.

Load-a-sample: populated two real ICS URLs (gov.uk bank holidays + a Chelsea fixtures feed) with
prefixes on. Minor gap vs the "instant populated merge" promise — it fills the fields but does NOT
auto-run the merge; I still had to click Preview. Not a blocker, but one extra click.

Preview (sample): per-source status "✓ [Holidays] — 83 events fetched", "✓ [Personal] — 325 events
fetched", reconciliation "Fetched 408 events → kept 408 after filters & mask", and a chronological
NEXT 15 list with source tags. Counts reconcile — I trust it.

Bad feed: dead domain in source 1, real feed in source 2 → "✗ ...example — fetch failed" + "✓
www.gov.uk — 83 events fetched" + "Fetched 83 → kept 83" + "1 source failed — its events are not
included." HONEST partial failure, exactly right. This is the screenshot I'd post in Slack.

Filter+mask: exclude "bank holiday" dropped 408→375 (math checks). Busy mask turned titles into
"[Personal] Busy". Create feed gave https Feed URL + webcal:// URL + Add-to-Google button + per-app
instructions + a "treat it like a password" warning. Copy → "Copied!", clipboard held the URL.
curl'd the feed endpoint: valid VCALENDAR ICS, and with mask on the UID was "busy-…" with titles
stripped — the mask applies to the SERVED feed, not just the preview. That's the real test passing.

No console errors, no pageerrors, no layout jank beyond the one missing space.

## Answers
1. CLARITY: Yes. Hero sentence + "No account" + a visible Preview button told me what it does and
   who it's for instantly. Nothing confused me.
2. VALUE: Yes. This is literally my use case — merge a GitHub sprint ICS + personal Google Cal + a
   meetup feed, exclude-filter the noise, one webcal link. Today I subscribe to three feeds manually
   in Google Calendar with no way to drop all-day junk. This does it free, no signup, with honest
   per-source status and a working privacy mask. I'd use it weekly as sprints rotate.
3. ADVOCACY: 9/10, found-preview-cold YES. I'd drop it in team Slack today. Off a 10 only because
   (a) "Load sample" doesn't auto-preview as the copy implies (one dangling click), and (b) the
   "kept 375after" missing-space bug — tiny, but I notice string/CSS jank instantly and it dents the
   "this is polished" pitch by a hair.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["'Load a sample feed' fills the URL fields but does not auto-run the merge — copy implies an instant populated merge, but I still had to click Preview", "Cosmetic: reconciliation reads 'kept 375after filters & mask' — missing space between count and 'after'"], "priorConcernsAddressed": "n/a"}
```
