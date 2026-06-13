```json
{"tester":1,"name":"Priya","clarity":"Yes","value":"Yes","advocacy":8}
```

# Priya — Senior backend engineer, skeptical, network-tab-checker

## 30-second read
CLARITY: Yes. The h1 "iCal Blend" plus the subhead "Merge 2-5 calendar feed URLs into
one subscribable feed — with optional keyword filters and a busy-only privacy mask. No
account, nothing stored: your whole setup lives encrypted inside the URL" told me exactly
what it is, who it's for, and hit my two trigger words: "No account" and "nothing stored."
That copy is aimed at me. I'd describe it to a teammate as "merge your PagerDuty + release
+ personal ICS into one subscribe URL, no login, stateless."

## What worked (and survived my poking)
- Core flow is one screen, no signup, keyboard-friendly. Pasted 2 gov.uk ICS feeds, set
  include="bank", checked busy-only, hit Create. Done in ~10s. Faster than any GUI tool.
- The merged feed is a VALID calendar. `curl` returns `content-type: text/calendar`,
  proper VCALENDAR/VEVENT (67 events), `content-disposition: inline; filename`, and sane
  caching (`s-maxage=300, stale-while-revalidate=600`). It'll just work in any client.
- Busy mask + filter actually applied server-side: every SUMMARY became "Busy", only
  bank-holiday events survived the include filter. Preview pane matched the curl output.
- I CHECKED THE NETWORK TAB. One POST /api/token, no analytics, no cookies. The "stored"
  claim holds up: identical config posted twice returned DIFFERENT tokens (random nonce =
  real authenticated encryption), and both tokens resolve to the same feed — so there's no
  DB row, the config rides inside the opaque token. A fabricated/truncated token returns
  400, not a 404 lookup-miss. This is genuinely stateless. That alone earns my trust.
- Failure handling is graceful: unreachable sources don't error out — the feed injects a
  visible "iCal Blend: N sources failed" VEVENT. Smart for a subscribe-once-and-forget feed.

## Friction / what holds it back
- SSRF smell: POST /api/token happily accepted `http://169.254.169.254/...` and
  `http://localhost:8080/admin` as sources and minted a token. The server-side fetch did
  fail cleanly (no internal data leaked, 0.14s, "sources failed" event) — but as a backend
  eng I want link-local/private/loopback IPs rejected at submit time, not silently fetched.
  This is the one thing that made me pause before I'd put my real on-call feed through it.
- Silent partial merge: example.com (200 but not a calendar) got merged with 0 events and
  NO warning in the web UI — only truly-unreachable URLs trigger the "failed" event. A
  typo'd HTTPS feed that returns an HTML 200 would vanish without telling me.
- No web-UI validation that a pasted URL is reachable/parseable before I subscribe. I'd
  like a "fetched OK, N events" check per source on Create.
- Token URL is enormous (~170 chars). Fine for paste, ugly in a terminal. Minor.

## Single biggest thing to raise advocacy (8 -> 10)
Reject private/link-local/loopback targets in /api/token and show a per-source
"fetched, N events / FAILED" status on Create. Once I can see each source validated and
know an internal-network SSRF is impossible, I'd put my PagerDuty rotation through this and
recommend it in my team Slack unprompted.
