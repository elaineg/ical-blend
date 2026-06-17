```json
{"tester":7,"name":"Aisha","clarity":"Yes","value":"Yes","advocacy":9}
```

# Aisha — Product designer (round 2)

## Prior concerns — all addressed
1. SILENT EMPTY SUBMIT — FIXED. Submitting with a blank field now shows
   "Add at least one calendar feed URL to get started." Calm, instructive, not scoldy. Good.
2. DEAD COPY BUTTON — FIXED, and over-delivered. Label flips "Copy" → "Copied!" AND a green
   "Copied to clipboard" line appears under the field. Clipboard genuinely received the URL
   (verified the read). Double confirmation on a 200-char opaque URL — exactly the trust I wanted.
3. ORPHANED ERROR — FIXED. Bad URL now shows a red-bordered field with the message DIRECTLY
   under the offending input: "That doesn't look like a calendar feed URL (needs to start with
   https:// or webcal://)." Correcting the input and tabbing out clears the stale message. This
   is the per-field validation I asked for in round 1 — no more hunting which row is wrong.

## Bonus craft wins I didn't ask for
- Preview is now DATE-SORTED (Jun 15 → Aug 3 → Aug 31 → Nov 30 → Dec 25...). The round-1
  "wall of random dates" is gone; the merge reads believable now (114 events, 2 sources).
- New H1 "Stop checking three calendars" is a sharper hook than the old "iCal Blend" — leads
  with the pain, not the product name. The subhead still does honest work.
- Result screen is genuinely considered: green confirmation banner → big "Add to Google
  Calendar" CTA → both URLs with copy → per-platform subscribe steps. Logical reading order.
- Error tone and empty-state copy are warm and exact. Zero console/page errors across all flows.

## Remaining craft nit (the only thing between this and a 10)
- On submit, the form stays fully expanded and the result renders BELOW it — no scroll-to-result
  and no visual collapse. On my big display the result is below the fold; a small auto-scroll or
  collapsing the form into a compact "edit feed" summary would make the success moment land.
- Minor: "Merged 114 events" with busy-mask OFF still shows real titles in preview (correct), but
  I'd love a one-line preview note when the mask IS on, reassuring me titles are hidden in output.

## What would make me shout about it in our design Slack
The edges are fixed — and edges are where I judge craft. The Copy double-confirm and per-field
errors are exactly the kind of considered detail I screenshot as a good example. Add the
scroll-to-result polish and I'd post it unprompted. It already cleared my bar to recommend.
