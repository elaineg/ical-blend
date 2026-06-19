# Round 2 — Tomás (Operations analyst, Edge/Windows, wary of pasting internal feed URLs)

**Advocacy: 8/10 · Clarity: Yes · Value: Yes**
**Found per-feed keyword filters AND active-filter badge cold: YES**

## Cold open (30s)
H1 "One feed from all your calendars — work, personal, or team" + subhead "Paste 2–5
calendar links. Get one subscribable feed. No account." told me exactly what it is and
that it's no-signup. The line "Hide private titles from shared versions with one checkbox"
is the hook that made ME — the guy who needs to hand a vendor a stripped feed — keep going.

## (b) Purpose clear in 5s? YES
Title + "merge calendar links → one subscribable feed, no account" is unambiguous. The
`Source feeds (ICS / webcal URLs)` label and example placeholders confirm the input format.

## Per-feed filters + badge (my assignment, found COLD)
- Each feed row has an "Options & filters" disclosure with the micro-hint
  `prefix · keyword filter · mask`. Obvious it's collapsible; I expanded feed 1 in one click.
- Expanded panel has everything I'd want per-feed: label/prefix ("[Work]"), **Mask this
  feed's titles** ("Show this feed's events as 'Busy', keeping other feeds detailed"),
  Hide all-day events, and per-feed Include/Exclude keywords with the correct note
  "These ADD to the global keyword filters above — an event must pass both." That AND
  semantics being spelled out is the kind of precision an ops analyst trusts.
- Active-filter badge: once collapsed, the row showed **"Options & filters · on"** with
  **"include: release · prefix"** inline. Found it without being told. Good.

## Privacy mask + trust (my core concern)
The per-feed "Mask this feed's titles" is EXACTLY my use case — strip my work feed to Busy,
keep the facilities feed detailed, hand the link to a vendor. Global "Busy-only privacy
mask" also present. The result caption is honest, not marketing: "Your config (including
source URLs) is encrypted into this link... our server decrypts the link and fetches your
feeds... never stored persistently, **but they do transit the server.**" THAT clause is why
I'd actually trust it more, not less — it doesn't pretend to be magic client-side. It's also
the one thing that gives me pause for a genuinely internal Outlook/SharePoint feed URL: it
transits a third-party server, so for a truly sensitive internal feed I'd still want to vet
it with IT first. For the masked vendor hand-off, the disclosure is enough for me.

## (c) Valuable? YES
Today I'd ask IT for a combined feed (slow) or juggle two subscriptions in Outlook and eyeball
overlaps. This gives one subscribe URL with per-feed masking in a single session, no install
(I'm install-blocked) — real saved effort. "Add to Google Calendar" + explicit Outlook/Apple
paste steps mean I can actually act on the output.

## What holds it back (why 8 not 9–10)
1. Fake URLs both failed ("HTTP 400 / fetch failed") — expected for placeholders, and it
   degraded gracefully ("Events from remaining sources are included, retries on refresh").
   But I never saw a REAL merged event, so I can't fully vouch it works end-to-end yet.
2. "URLs transit the server" is honestly disclosed but is a hard ceiling for the most
   sensitive internal feeds — I'd hand it a vendor-safe masked feed, not raw SharePoint,
   until IT signs off. A self-host / client-side-only mode would push this to a 9.
3. The opaque ~190-char feed token is fine but the "treat it like a password" warning means
   I can't casually reshare; minor.

Copy button verified (label → "Copied!", clipboard read returned the URL). No console errors.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Couldn't see a real merged event — both placeholder feeds 400/failed, so end-to-end unproven for me", "Source URLs transit the server (honestly disclosed) — hard ceiling for truly sensitive internal feeds; want a client-side/self-host mode", "Opaque feed token + 'treat like a password' limits casual resharing"], "priorConcernsAddressed": "n/a"}
```
