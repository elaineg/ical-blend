# Priya — Senior backend engineer (terminal-first, hates signups, inspects the network tab)

Cold open, desktop 1440px. Headline "Stop checking three calendars", subhead "Paste 2–5
calendar links. Get one feed. No account..." Got it in under 10s. This is exactly the
thing I keep meaning to hand-roll with `cat *.ics | ...` and never finish.

## Clarity — Yes
"Merge 2–5 ICS feed URLs into one subscribable URL, no login, nothing stored — and you can
hand someone a privacy-masked version." The "Source feeds (ICS / webcal URLs)" label and
the "Nothing is stored on the server — the feed URL itself carries your encrypted
configuration" footer told me precisely how it works without reading code. As a backend
person, "config lives in the URL token, no DB" is the design I'd have picked, and the
network tab confirmed it: POST /api/token mints a token, GET /api/feed/<token> serves the
ICS. No cookies, no storage call. That earns trust.

## Per-feed Options — found instantly, and genuinely distinct
The "Options" disclosure sits right under each feed row on cold load (collapsed, "▸
Options"). Not buried — I clicked it without hunting. Expanded it shows: "Label added to
this feed's event titles" (placeholder [Work]), "Mask this feed's titles" ("Show this
feed's events as Busy, keeping OTHER feeds detailed"), and "Hide all-day events from this
feed". After configuring, the summary updates to "Options · on" — nice signal.

The distinction from the global "Busy-only privacy mask" is well drawn: the global one says
"Applies to all feeds. Need it for just one? Use a feed's Options." That one line removed
all ambiguity. I set [US] prefix on one feed and masked the other; the on-page preview
rendered "[US] Juneteenth / [US] Independence Day..." and, when I masked the reliable feed,
every title became "Busy". Verified the token feed over curl too: SUMMARY:[US] New Year's
Day. It actually does what the UI claims.

Copy cue: "Copy" → "Copied!" + "Copied to clipboard" confirmation fired; clipboard read
verified the full feed URL. Works.

## Value — Yes
Today I either live with 3 separate subscriptions in Apple Calendar or hand-merge ICS in a
script I never maintain. This is faster and the per-feed prefix solves a real thing — my
PagerDuty feed and release feed look identical in a merged view until I tag them. Saves me
real effort, no auth, subscribable once. This is the rare tool I'd actually keep a tab for.

## Issues
- The Google ical feed (UK holidays) returns 429 server-side every time (confirmed via curl
  directly — Google rate-limits, NOT an app bug). The app degraded correctly: merged the
  feeds that worked, showed a clear non-blocking "Source 2 could not be fetched... will
  retry on refresh." Good handling. But a skeptical user will blame the app — worth a
  hint that some providers (Google) throttle and it retries.
- Honesty nit: the summary said "1 feed labelled" even though the labelled feed FAILED to
  fetch — it counts configured intent, not rendered reality. Minor, but I noticed.
- "Creating…" took ~5–10s with no spinner/progress; on a slow feed I briefly wondered if it
  hung. A backend dev waits; a normal user might re-click.

## Answers
(a) Advocacy: 8/10 — I'd bring this up in a Slack channel unprompted. Not a 9 only because
    the silent multi-second "Creating…" and the misleading "labelled" count on a failed
    fetch are small trust dings, and one of my two real feeds (Google) won't load due to
    429 throttling, which is the exact failure mode my use case hits.
(b) Value clear in <30s? Yes.
(c) Biggest blocker: external feed providers (Google) 429-throttle server-side fetches, so
    a Google-sourced feed silently lands in the "could not be fetched" bucket — for an
    on-call/release-calendar user whose feeds are often Google-hosted, that's the make-or-
    break, and the app should name the throttle + show retry behavior more reassuringly.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["Google-hosted ICS feeds 429-throttle on server fetch and land silently in 'could not be fetched' — app should name the throttle/retry, not just count it as a generic failure", "Summary says '1 feed labelled' even when that feed failed to fetch — counts intent not rendered reality", "'Creating…' runs several seconds with no progress indicator"], "priorConcernsAddressed": "n/a"}
```
