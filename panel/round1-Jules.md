# ical-blend — Round 1 — Jules (Content & community marketer, medium-tech, 50/50 desktop/mobile)

Motivation: merge several community-event ICS feeds (Discord, Luma, newsletter cal) into one
keyword-filtered subscribe-able feed — and I refuse to log in for a job this small.

## What I did (cold)
Pasted two real public ICS feeds (officeholidays USA + Google USA holidays). Found the per-feed
"Options" disclosure, opened feed 1, set per-feed Include="Regional". Set GLOBAL Exclude="Eve".
Hit Create feed. Got an http feed URL + webcal:// link + "Add to Google Calendar". Subscribed-as
test: fetched the generated feed — 313 events, NO "Eve" titles (global exclude worked), and feed 1
kept only "Regional" USA: events while feed 2 was untouched. AND-composition is honest. Repeated on
375px mobile — per-feed Options expand and the Include/Exclude fields are fully reachable.

## (a) Advocacy: 8/10
This is the no-login ICS merger I've actually wanted and never found free. It does the merge, the
keyword filter, AND gives me copy-paste subscribe steps for Google/Apple/Outlook plus a "Preview —
exactly what subscribers see" list. That preview is the trust-maker for a marketer publishing a feed.
Not a 9 because: my real feeds are Discord/Luma/Mastodon — I can't tell cold whether webcal auth feeds
or feeds behind a token URL will fetch, and there's no "test this feed" check before Create, so I'd
discover a dead feed only after subscribing. Also the helper text is dense; the per-feed vs global
distinction took me a beat. Fix those and it's a 9 I'd post about.

## (b) Clarity: Yes
"One feed from all your calendars" + "Paste 2–5 calendar links. Get one subscribable feed. No account."
told me what and who in under 5 seconds. The "No account" line is what made me actually try it.

## (c) Value: Yes
Today I manually eyeball multiple calendars or paste links into a clunky aggregator that wants a login.
This merged + filtered in one session with zero signup and gave me a real webcal link. Saves meaningful
effort vs. my current "subscribe to 4 feeds separately and mute the noise" workflow.

## Per-feed keyword fields — found COLD? YES
The global include/exclude even points to it ("Want different keywords per feed? Use that feed's
Options."). Opening Options revealed "Keywords — this feed only" Include/Exclude with the exact
`piano, soccer` / `standup, lunch` placeholders, comma = OR. Both per-feed and global filters worked and
composed with AND, stated plainly in the helper text. Minor: collapsed-by-default means a hurried user
might miss per-feed filtering and assume only global exists — the pointer text mitigates it.

## Top blockers
1. No "test/validate feed" before Create — a dead or auth-gated Discord/Luma feed fails silently post-subscribe.
2. Dense helper copy; per-feed-vs-global AND relationship takes a second read.

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No pre-Create feed validation/test — auth-gated or dead feeds fail silently after subscribe", "Dense helper copy; per-feed vs global AND relationship not instantly obvious"], "priorConcernsAddressed": "n/a"}
```
