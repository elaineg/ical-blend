# Elena — Engineering manager (8 reports), wall-to-wall Google Calendar, 30s patience

Tested cold on laptop (set up between meetings; I'd grab the link for my phone).

## Clarity — Yes
I'd tell a friend: "Paste 2-5 calendar links, it spits out ONE link you subscribe to, so
you stop flipping between calendars." The headline "Stop checking three calendars" + subhead
"Paste 2-5 calendar links. Get one feed. No account." nailed it in about 8 seconds. "No
account" is exactly what makes me keep reading instead of bouncing. The "hand others a
version with the private titles hidden" clause is the bit that made me think about my on-call
feed specifically. Nothing confused me on the page.

## Value — Yes
Today I do nothing — I just eyeball 3 separate Google Calendars (team on-call, recruiting
interviews, personal) and miss things. The one real alternative is begging IT/Workspace
admin to set up calendar sharing, which is a ticket and a week. This did it in one screen,
no login, in ~5 seconds. That's a genuine save. The per-feed PREFIX is the feature that
sells it for me: I labelled the US feed "[OnCall] " and confirmed every on-call event came
through tagged while my other feed stayed clean — so in my merged phone calendar I can tell
at a glance which world an event is from. That's the thing my eyeball-three-tabs workflow
can't do.

## Per-feed Options — found instantly, works
- "Options" disclosure shows on EVERY feed row on cold load (counted 2). It did NOT read as
  missing — it's right under each URL box. Expanded in one click; panel is labelled "Label
  added to this feed's event titles" with a "[Work]" placeholder. Obvious.
- Prefix vs global "Busy-only privacy mask": clearly distinct. The global mask sits lower in
  its own block and literally says "Applies to all feeds. Need it for just one? Use a feed's
  Options." That sentence is what removed any doubt — good.
- Speed to first merged feed: ~4.5s incl. fetching two real feeds. Well inside my budget.
- Copy: button flipped to "Copied!" and the URL was actually on my clipboard. Works.
- Merge banner "Merged 59 events from 2 sources. 1 feed labelled." is a nice confidence cue.

## Friction
1. The first feed row ships PREFILLED with a `googleapis.com/.../usaholiday` URL and row 2
   shows an `example.com/calendar-2.ics` placeholder. I had to stop and clear/overwrite the
   prefilled one — for a 30s user that's a "wait, is this mine or a sample?" beat. Make row 1
   empty with a placeholder like row 2.
2. Only "Add to Google Calendar" as a one-tap button. I live in Google Cal so fine for me,
   but I'd hand this link to reports on iPhones — an "Add to Apple Calendar" / clear
   "subscribe on your phone" path would matter for advocacy. The subscribe instructions are
   there as text but it's a wall of small print.

## Answers
(a) Advocacy: **8** — I'd bring this up to my peers managing on-call rotations. Not a 9
    only because the prefilled-junk-feed first impression made me hesitate for a second, and
    the phone-subscribe story is text-heavy rather than one-tap. Fix those and it's a 9.
(b) Value clear in <30s? **Yes.**
(c) Single biggest blocker: the **prefilled dummy feed URL in row 1** — it forces a
    "is this a real value or a sample?" pause and an extra clear-the-field step before I can
    paste my own, which is precisely the kind of micro-setup that loses 30s-budget users.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Row 1 ships prefilled with a dummy googleapis feed URL — forces a confused clear-the-field step before pasting my own", "Phone-subscribe path is text-heavy small print; only one-tap option is Add to Google Calendar, no Apple Calendar"], "priorConcernsAddressed": "n/a"}
```
