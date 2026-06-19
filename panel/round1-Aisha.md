# ical-blend — Round 1 — Aisha (Product designer, judges craft hard)

Device: desktop 1280px, trackpad. Used cold, no source read.

## (b) Clarity within 5s — YES
H1 "One feed from all your calendars — work, personal, or team" + subhead naming the exact
job (paste 2–5 links, get one subscribable feed, no account, merge work/personal/family).
That subhead literally describes MY use case (personal + partner + kids' school ICS). The
"No account" line lands the wedge immediately. Nothing confused me above the fold.

## (c) Value — YES
Today I hand-import three ICS feeds separately into Apple Calendar and they never stay in
sync; re-subscribing is manual. This gives me ONE auto-refreshing webcal link. I ran a real
merge with two public US-holiday ICS feeds: 28 events from 2 sources, got a feed URL +
webcal:// + an "Add to Google Calendar" button + a "what subscribers see" preview. That
preview is the trust-builder — I can see exactly what lands before I subscribe. Genuinely
saves me real recurring effort.

## Per-feed keyword fields — FOUND THEM COLD? Mostly yes.
The fields live inside a collapsed per-feed "Options" disclosure. I would NOT have guessed
keyword filtering hides under a feed's "Options" on my own — BUT the global keyword section
has a quiet helper line "Want different keywords per feed? Use that feed's Options." That
signpost is exactly the considered touch I reward; it pointed me straight in. Expanded the
disclosure: clean panel — Label, Mask titles, Hide all-day, then "Keywords — this feed only"
with Include/Exclude (placeholders piano, soccer / standup, lunch) and the line "These ADD
to the global keyword filters above — an event must pass both." Composition explained in
plain words, no jargon.

## Both filters, end-to-end — WORK CORRECTLY
Per-feed include "christmas" on feed 1 + global exclude "labor". Result: feed 2 kept all
holidays, feed 1 narrowed to only Christmas, Labor Day dropped everywhere, and the result
header honestly states "excluding 'labor'". The AND-compose behaved exactly as the copy
promised. 0 console errors through the whole flow.

## Craft critique (I grade this hard)
+ Copy tone is consistent, human, and honest (the encryption/"URLs transit the server"
  disclosure is refreshingly candid — most tools would hide that).
+ Disclosure hierarchy is sensible; helper microcopy under each global field is the kind of
  considerate signposting that loses most tools points and earns this one.
+ Recent-blends history with editable nicknames = thoughtful return-flow.
- Minor: the per-feed filter is discoverable ONLY via the global helper line — if that line
  were missing, the feature is buried. It's a one-link-deep secret. I'd want a tiny inline
  hint on the Options summary itself (e.g. "Options · filters, labels").
- Minor: feed/webcal URLs are giant opaque blobs shown raw; visually heavy. A truncated
  pill with the Copy button would read cleaner.
- Empty state of an expanded Options is fine but slightly dense (5 controls stacked); could
  group "Privacy" vs "Filters" with subtle dividers.

## (a) Advocacy — 8/10
I'd bring this up unprompted to a peer wrestling with multi-calendar sync — it nails the
job, the copy is considered, and both filter layers actually work. Held back from 9 by: the
per-feed filters being one-helper-line away from invisible, and the raw URL blobs reading
clumsy. Polish those and it's a 9.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["per-feed keyword filters are discoverable only via one global helper line — buried inside a collapsed Options disclosure", "raw giant feed/webcal URL blobs read visually clumsy; want truncated pill + copy"], "priorConcernsAddressed": "n/a"}
```
