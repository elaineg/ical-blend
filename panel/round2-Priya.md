# Round 2 — Priya (Senior backend engineer; skeptical, keyboard-first, network-tab inspector)

## THIS round's specifically-confirm items (Preview & test your feeds)
1. **Reconciliation spacing** — FIXED. Renders `Fetched 408 events → kept 408 after filters & mask`
   with proper spaces. The round-1 `kept 408after` bug is gone. With one feed down it correctly
   reads `Fetched 83 events → kept 83 …`.
2. **Load a sample feed = ONE click** — PASS. One click populated the entire preview: per-source
   `✓ [Holidays] — 83 events fetched` / `✓ [Personal] — 325 events`, the reconciliation count, and
   the next-15 list with `[source]` labels. I never touched "Preview merged calendar". Clean.
3. **Honest failure** — PASS, and well done. A bogus host shows `✗ this-host…invalid — fetch failed`,
   the kept-count drops to only the survivor, it prints `1 source failed — its events are not
   included.`, AND it injects a `1 source failed` event into the feed so a subscriber notices in
   their actual calendar. That is honest, not papered-over.

## 1. Gut reaction (first 30s) + would I use it for real?
Yes, plausibly. Headline names my exact pain ("stop checking three calendars… one link you
subscribe to once"). Today I merge an on-call/PagerDuty ICS + release-feed + personal by
hand-importing each into my calendar and re-importing when they drift — or a cron that concats
ICS (no filtering, no mask). This is the first such tool whose privacy story survived my network
tab: on "Create feed" the only POST is `/api/token`, which returns an opaque 208-char feed link;
identical input yields a *different* token each call (random nonce) and the feed resolves with no
prior "save" GET — i.e. stateless, config encrypted into the link. Page states it plainly:
**"No account, no database. Your source URLs are encrypted into the feed link and fetched
server-side on each refresh — never stored persistently."** Matches what I observed. The
post-create "Add to Google Calendar" button + Copy URL handle the last mile. Good.

## 2. Single biggest blocker
**The feed link IS the secret, and nothing on the page warns me.** My PagerDuty/Google source
URLs carry auth tokens; they're encrypted *into* the feed link, so anyone with that link can
have your server re-derive and fetch my on-call feed. There's no "treat this link like a
password / don't paste it in Slack" caption — I grepped the page, it's absent. For my exact
use case (authed on-call feeds) that's the one thing that stops me handing this to the team
unconditionally. Related: the merge is server-side (unavoidable, CORS) so my feed creds transit
your proxy on every refresh — honest, but a real "do I want a permanent third party in the path
of my on-call token?" decision. Minor: prod must be HTTPS-only before I trust the link with creds.

## 3. Scores
- **Clarity: 9/10** — headline + "No account, no database… encrypted… never stored" is exactly
  legible; understood well under 30s.
- **Value: 8/10** — beats my manual re-import / concat-cron with filters + busy-mask + one URL;
  real weekly time saved.
- **Advocacy: 8/10** — I'd recommend it with the caveat "your feed link embeds your source URLs,
  guard it like a password." Not a 9 only because that warning is missing for authed feeds, which
  is precisely the audience (on-call engineers) who'll paste the link into Slack. Add the
  treat-as-secret caption and I'm at 9.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["feed link embeds source URLs (incl. authed PagerDuty tokens) but no 'treat this link like a password' warning — on-call engs will paste it in Slack", "merge is server-side: private feed creds transit the proxy on every refresh (honest but a real consideration); confirm HTTPS-only in prod"], "priorConcernsAddressed": "all"}
```
