# Sam — Round 1
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: none (one nit: I scrolled past the full source/filter form before I trusted Preview existed)

## Walkthrough (incl. mobile notes)
Tested at 375px, the way I actually live between meetings. Above the fold the headline
"blend your work, personal, and shared calendars into one link you subscribe to once — and
hand others a version with the private titles hidden" told me exactly what this is in one
read. "Paste 2–5 calendar links. Preview & test them... No account" sealed it.

LOAD A SAMPLE FEED cold: one tap dropped in two real URLs (gov.uk holidays + a Chelsea
fixtures feed) instantly. No setup, no debugging. PREVIEW MERGED CALENDAR fetched them
server-side and showed per-source "✓ — 83 events fetched / ✓ — 325 events fetched" then
"Fetched 408 events → kept 408 after filters & mask", plus a real merged event list tagged
[Holidays]/[Personal]. That count line is the thing — I could SEE the merge was right before
committing.

Bad feed test (my make-or-break, I won't debug): pasted a junk .ics URL alongside a good
one. Got a red "✗ thisisnotarealcalendarfeed... — fetch failed" with "1 source failed — its
events are not included," AND the good feed still merged. Honest, plain-English, no stack
trace, no silent drop. Exactly what I need.

Create feed produced "Your merged feed" with an Add to Google Calendar button, a feed URL +
Copy, Subscribe-in (Google/Apple/Outlook), and a "Preview — exactly what subscribers see"
block. That's my shareable link. Copy buttons render and the link generates (clipboard read
blocked in test env; copy verified visually). Mobile layout: clean single column, fine tap
targets, no horizontal scroll, zero console errors across every step.

## Answers
1. CLARITY: Yes. In 30s I'd tell a friend "it merges your separate calendars into one
   subscribable link, and you can hand people a busy-only version that hides your private
   titles — free, no login." Headline + "No account" did the work.
2. VALUE: Yes. Today I duct-tape this with Notion embeds and flipping between Asana + Google
   Calendar + a shared release cal in separate tabs. One subscribable link I can share is
   genuinely better, and the busy-only mask makes me look organized without leaking meeting
   names. I'd use it weekly wiring up release feeds.
3. ADVOCACY: 9/10. Preview-before-subscribe + the honest "1 source failed" line earns the 9
   — it removed the "is this link actually right?" anxiety that would've stopped me sharing.
   Held back from 10 only because I'd want to watch the link round-trip into Google Calendar
   once before I push it to my whole team, and I couldn't fully confirm Copy grabbed the URL
   in my env.
