```json
{"tester":2,"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":8}
```

# Marcus — Frontend engineer, 2yrs (high tech, desktop Chrome + devtools)

**CLARITY: Yes.** The h1 "iCal Blend" + the subhead "Merge 2–5 calendar feed URLs into one
subscribable feed — with optional keyword filters and a busy-only privacy mask. No account,
nothing stored: your whole setup lives encrypted inside the URL." told me everything in ~3s.
"No account, nothing stored… encrypted inside the URL" is the line that sold me — that's
exactly the kind of stateless, no-signup tool I'd drop in team Slack. The form is
self-explanatory: source feed inputs, include/exclude keyword boxes with the helper text
"Keywords match event titles, case-insensitively", and the busy-mask checkbox with a clear
description.

**VALUE: Yes.** Today I cobble this together with a hacky Vercel cron + a tiny node script
that re-hosts a merged ICS, or I just subscribe to 3 separate feeds and live with the noise.
This nails my exact need: merge my GitHub milestone ICS + personal Google + a meetup feed,
exclude-filter the noise, and the busy-only mask is perfect for sharing a sanitized
availability feed. The output gives both an `https://` Feed URL AND a `webcal://` link plus
copy buttons and Google/Apple subscribe instructions — no guessing.

## What worked (verified)
- Pasted england-and-wales.ics + scotland.ics, exclude="substitute", busy mask on → Create
  feed produced a token URL instantly, no console errors.
- curl'd the feed URL: `HTTP 200`, `content-type: text/calendar; charset=utf-8`,
  `content-disposition: inline; filename="ical-blend.ics"`, and proper
  `cache-control: public, s-maxage=300, stale-while-revalidate=600`. Valid VCALENDAR,
  every `SUMMARY:Busy` (mask working), source UIDs preserved. Clean, correct, cacheable.
- Live "Preview — upcoming events" with the "2 sources · excluding \"substitute\" · busy-only
  mask on" summary line — great confidence signal that filters actually applied.
- CSS/craft: tidy, consistent spacing, real focus states, nothing janky. Looks shippable.
- Garbage URL ("not-a-url") → clean inline error "Not a valid URL: not-a-url" (the API 400
  is correct rejection, not a bug).

## Friction / bugs
- **Single feed = silent no-op.** Filled only feed #1 and hit Create feed: no feed URL, and
  NO error message at all. The button just appears to do nothing. Either disable it with a
  hint or say "add at least 2 feeds". A confused user thinks it's broken.
- **Masked duplicates look like a bug.** With the busy mask on, England+Scotland shared
  holidays (e.g. two "Busy" rows on Fri Dec 25, two on Mon Dec 28) show as identical
  adjacent rows in the preview. As a dev I get it (two sources, same date), but it reads as
  duplicate/buggy output. Consider de-duping identical masked events on the same datetime.
- Token URL is enormous (~180 chars). Fine technically (it's the encrypted config), but a
  short note like "long by design — it holds your whole config" would preempt the "is this
  safe to paste?" question for less-technical teammates.

## Biggest thing that would raise advocacy (8 → 9/10)
De-dupe identical masked events in both the preview AND the output feed, and give the
single-feed case a real message. The silent no-op is the one thing that'd make me hesitate
before pasting this in Slack — a teammate hitting it would assume the tool is broken. Fix
that and I'm bringing it up unprompted.
