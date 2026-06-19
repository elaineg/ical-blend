# Round 2 — Marcus (frontend eng, 2yr, Chrome+devtools)

Job: merge GitHub sprint ICS + personal Google Calendar + a meetup feed into one
subscribe-able feed, drop noisy all-day events. Used cold over Playwright.

## Verdict
- **Advocacy: 9/10** — I'd drop this in team Slack unprompted. "Merge 3 calendars into
  one no-signup webcal link, per-feed filters, hides all-day junk" is a clean sentence.
- **Clarity (5s): Yes.** H1 "One feed from all your calendars — work, personal, or team"
  + subhead "Paste 2–5 calendar links. Get one subscribable feed. No account." nails the
  what + the no-signup hook in one read. The form is the page; nothing to hunt for.
- **Value: Yes.** Today I manually subscribe to 3 separate ICS feeds in Google Calendar and
  eat every birthday/holiday all-day event. There's no native way to merge + filter. This
  gives me ONE webcal link with per-feed all-day suppression — that's a real recurring win.

## Found per-feed filters + active-filter badge cold: YES
- Each feed row shows a muted micro-hint `prefix · keyword filter · mask`. Clicking
  "Options & filters" expands: prefix label (`[Work]`), "Mask this feed's titles", **"Hide
  all-day events from this feed — Drop birthdays/holidays"** (exactly my noisy-event ask),
  and per-feed Include/Exclude keyword inputs. Scoped per-feed AND there's a global
  Include/Exclude block + a Busy-only privacy mask. Discoverable with zero hunting.
- The active-filter badge is the standout: once I set a prefix + exclude:birthday +
  hide-all-day and collapsed the row, the disclosure flipped to a violet pill
  **"Options & filters · on"** plus a second pill **`exclude: birthday · prefix`**
  summarizing what's active. Unset feeds stay muted-grey. That state distinction is the
  kind of detail I notice and trust.

## Craft / engineering (devtools open)
- 0 console errors, 0 page errors across the whole flow. CSS is tidy — consistent spacing,
  no jank, violet accent used purposefully.
- Generated feed serves real `text/calendar` with `s-maxage=300, stale-while-revalidate`
  and `content-disposition: inline; filename="ical-blend.ics"`. Correct.
- Honest failure handling: a dead source doesn't 500 or vanish — it emits a VEVENT
  "iCal Blend: 1 source failed / Source 3 could not be fetched. Remaining sources included"
  and the UI shows "1 source could not be fetched". I'd rather see this than a silent drop.
- Result page is complete: webcal + https URLs w/ Copy, "Add to Google Calendar" button,
  per-app subscribe instructions, a live "exactly what subscribers see" preview with a
  caption (`3 sources · excluding "standup" · 1 feed labelled`), and a localStorage
  "recent blends" list. (Copy verified visually; clipboard read blocked in test env.)

## What holds it back from a 10
- Privacy caption is honest but slightly scary for a Slack pitch: "source URLs are
  encrypted into the feed link... but they do transit the server." A teammate merging a
  *private* work ICS will pause there. Not wrong, but it's the one line that makes me add a
  caveat instead of a clean rec.
- The feed token URL is enormous (~300 chars). Fine functionally, but it looks alarming
  when pasted raw; the webcal:// + button mitigate it.
- Couldn't see real merged events here (my placeholder/public feeds returned nothing
  fetchable from the sandbox), so I'm trusting the plumbing on infra + the failure VEVENT
  rather than seeing my GitHub sprint events land. Confidence high, not 100%.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["privacy 'URLs transit the server' caption makes me hedge a private-calendar Slack rec", "feed token URL is ~300 chars and looks alarming pasted raw"],
 "priorConcernsAddressed": "n/a"}
```
