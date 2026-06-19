# Priya — Senior backend engineer (round 2)

(a) Advocacy: **8/10**
(b) Value clear in <30s: **Yes**
(c) Biggest blocker: **The privacy claim slightly overstates itself — my source URLs ARE sent to the server (POST /api/token, plaintext JSON body) to be encrypted with a server-held key, then NOT stored. So "nothing stored server-side: not your source feed URLs" is true about storage but the URLs do transit the server, and "encrypted" is server-side-key, not E2E. Honest, but a network-tab skeptic notices the gap.**

## Round-1 concern — re-checked
My round-1 complaint was per-source FETCH FAILURES silently hanging on "Creating…". **FIXED, cleanly.** A bad feed now returns "Feed 2 — HTTP 404 — feed URL not found", the good feed still merges ("Merged 28 events from 1 source"), the dead feed is NOT counted, and it even injects a visible "1 source failed" marker event into the feed itself plus "will retry on each refresh." That's exactly the degradation behavior I want for an on-call/release feed. priorConcernsAddressed: all.

## Fresh take
- Cold open is legible immediately: "Stop checking three calendars" + the subtitle told me the whole job. First feed row empty now — good.
- Privacy regression I'd have feared is GONE: masked CA feed shows multiple distinct "[CA]Busy" entries (not collapsed) and keeps its "[CA]" prefix while "[US]Juneteenth" stays detailed. Cross-feed leak not reproduced.
- Recall list with editable nicknames + Copy URL solves "which opaque link is which" — the one thing that would've made me abandon an account-less tool.
- No console/page errors, no signup, fully keyboard-reachable. I'd paste this in team Slack for our PagerDuty + release-calendar merge — knocking 2 points off only for the trust-claim precision and that I'd want it self-hostable before trusting prod on-call URLs through a third party's encrypt endpoint.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Privacy note overstates: source URLs POST to /api/token in plaintext and are encrypted with a server-held key, not E2E", "Server is in the trust path for encryption; no self-host option for on-call URLs"], "priorConcernsAddressed": "all"}
```
