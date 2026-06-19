# Round 2 — Priya (Senior backend engineer, skeptical, network-tab inspector)

## What I did
Cold-loaded localhost:3022, pasted 2 real public ICS URLs (Google US-holidays + officeholidays USA),
expanded a feed's "Options & filters", set per-feed include=`holiday`/exclude=`observance`, set the
GLOBAL include=`US`, hit Create feed, then curled the generated `/api/feed/<token>` endpoint and
watched the network tab.

## (b) Purpose clear in 5s? YES
H1 "One feed from all your calendars — work, personal, or team" + sub "Paste 2–5 calendar links.
Get one subscribable feed. No account." nails it instantly. The "No account" upfront is exactly the
phrase that makes me, a signup-hater, keep reading instead of closing the tab.

## (c) Valuable to me? YES
This is literally my use case: PagerDuty rotation ICS + team release-calendar feed + personal, merged
into one webcal I subscribe to once. Today I do this with NOTHING good — I either eyeball three
calendars or hack a cron job that downloads ICS files and concatenates them (and concatenation alone
doesn't filter or privacy-mask). This does it in one paste, no login, and gives me a `text/calendar`
endpoint with `cache-control: s-maxage=300` so my client re-fetches. That beats my homemade script.

## Per-feed filters + active-filter badge cold? YES
- Found the per-feed disclosure cold: each feed row shows `▸ Options & filters  prefix · keyword filter · mask`
  as a micro-hint BEFORE expanding — that told me what's inside without clicking. Good.
- Expanded it: prefix (`[Work] `), include (`piano, soccer`), exclude (`standup, lunch`), per-feed mask. Clear.
- After setting filters and collapsing, the hint changed to `▸ Options & filters · on` AND an inline
  badge rendered: `include: holiday · exclude: observance`. I saw the active state cold, didn't have to
  re-open the panel to remember what I set. This is the detail that earns trust.
- Global filter present + clearly scoped: "Applies to all feeds. Want different keywords per feed? Use
  that feed's Options & filters." Preview header confirmed it: `2 sources · only "US"`.

## Network / trust check (I always do this)
- Only POST on Create was `/api/token` — source URLs encrypted into the opaque token, no DB write.
- Caption: "No account, no database. Your source URLs are encrypted into the feed link and fetched
  server-side on each refresh — never stored persistently." Matches observed behavior.
- `GET /api/feed/<token>` returned HTTP 200, `content-type: text/calendar; charset=utf-8`, valid
  VCALENDAR, 4 events with my include/exclude+global filters applied. It actually works end to end.
- Live PREVIEW pane ("exactly what subscribers see") rendered the real merged/filtered events before I
  subscribed — I trust the output without subscribing blind. Big plus.

## Gripes (what keeps it off a 9–10)
- The feed token is a ~250-char opaque blob with no human label in the URL. Fine for privacy, but I
  can't tell two blends apart by eye. The "Your recent blends" localStorage list with editable nicknames
  partly saves this — but it's device-local, so if I rebuild on my work laptop I've lost the mapping.
- Encrypting source URLs into the link means the link IS the secret. If my PagerDuty ICS URL contains an
  auth token (PD ones do), anyone with my feed link can derive my on-call feed server-side. The privacy
  caption should call this out — "treat this link like a password." It doesn't, and a careless eng will
  paste it in Slack.
- webcal:// link is generated but I'd want a one-click "Add to Google/Apple/Outlook" since that's the
  last-mile friction; right now it's copy-paste-the-blob.
- Minor: no rotation/refresh-interval control visible; I'm trusting the s-maxage=300.

## (a) Advocacy: 8/10
It does the exact job, no signup, stateless, verifiable in the network tab, output is real ICS. I'd
send this to a teammate today. Not a 9 because the "link = all your secrets" implication isn't surfaced
(real risk for PagerDuty/authed feeds) and there's no add-to-calendar one-click. Fix the secret-link
warning and I'm at 9.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["feed link embeds source URLs (incl. authed PagerDuty tokens) but no 'treat this like a password' warning", "no one-click add-to-Google/Apple/Outlook; user copies a 250-char blob", "blend identity is device-local localStorage only — opaque token has no human label"], "priorConcernsAddressed": "n/a"}
```
