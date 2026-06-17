# Priya — Senior backend engineer (round 3)

(a) Advocacy: **9/10** (round 2 was 8 → +1)
(b) Value clear in <30s: **Yes** — "Stop checking three calendars" + "Paste 2–5 calendar links. Get one feed. No account." names the job, inputs, and the no-signup hook above the fold. Nothing to puzzle out.
(c) Biggest remaining blocker: **The server is still in the trust path — my source URLs POST to /api/token as PLAINTEXT JSON, get encrypted with a server-held key, and the server fetches my feeds on every refresh. There's no self-host / E2E option. For genuinely sensitive on-call (PagerDuty) URLs I'd still want to run this myself.** This is now a *disclosed, honest* limitation rather than a misleading claim — which is exactly why it dropped from a blocker to a "missing nice-to-have."

## Round-2 concern — re-checked
My round-2 complaint was the **privacy copy overclaimed** (implied URLs never touched the server). **FIXED — and honestly.** The footer now reads verbatim: *"No account, no database. Your source URLs are encrypted into the feed link and fetched server-side on each refresh — never stored persistently."* That admits (1) the URLs live in the link, (2) the server decrypts + fetches on every refresh. As a skeptic who reads the network tab, that's the precision I asked for. priorConcernsAddressed: all.

## What I did / what worked
- Added both holiday feeds, set feed-1 prefix `[US]`, masked feed-2 (CA) busy-only, hit Create.
- UI: "Merged 65 events from 2 sources. 1 feed labelled. 1 feed masked." Per-feed Options now shows "Options · on" when configured — nice affordance.
- Network tab: single `POST /api/token`, body is plaintext `{"sources":[{url,prefix},{url,busyOnly:true}]...}`; response token is opaque ciphertext. No other calls, **0 console errors**, no signup, fully keyboard-reachable.
- curl'd the generated `/api/feed/<token>` → HTTP 200, `text/calendar`, 65 VEVENTs (matches UI exactly — no silent dedup loss across two feeds sharing dates like New Year's Day).
- **Prefix spacing fixed:** `SUMMARY:[US] New Year's Day` — exactly one space (round-2 spacing nit gone).
- **Mask holds at the wire:** every CA event is `SUMMARY:Busy`, DTSTART/DTEND kept, LOCATION/DESCRIPTION stripped, and the UID is re-anonymized to `busy-…@ical-blend`. Zero CA titles (Canada Day, Victoria Day, Boxing Day) leak. No cross-feed UID collapse — the round-1/2 P0 data-loss class is genuinely gone.
- Held back from a 10 only because there's no self-host path; I'd ship the public version to my team's release-calendar merge today and Slack it unprompted, but I'd want to host the on-call one myself.

```json
{"tester": 1, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["No self-host / E2E option: source URLs POST plaintext to /api/token and server fetches feeds each refresh (now honestly disclosed, but still 3rd-party trust for on-call URLs)"], "priorConcernsAddressed": "all"}
```
