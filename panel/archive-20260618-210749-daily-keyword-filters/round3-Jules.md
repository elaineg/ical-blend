# Jules — iCal Blend, Round 3

(a) **Advocacy: 8/10**
(b) **Value clear in <30s? YES.** "Stop checking three calendars / Paste 2–5 calendar links. Get one feed. No account." nails it for me instantly — I subscribe to a pile of community ICS feeds and want one merged link without logging in. The "no account" promise is right in the subhead and repeated in the footer.
(c) **Biggest remaining blocker:** No per-feed keyword filter. The include/exclude keyword boxes are GLOBAL only — per-feed Options give me a label, mask, and hide-all-day, but NOT "only keep events containing X from THIS feed." My actual use case is "keep only AMA/launch events from the Discord feed but everything from Luma," and I can't express that. Global filter applies one ruleset to all feeds.

## Round-2 → Round-3 re-check (my prior blockers)
- **P0 data-loss / blend creation:** FIXED. Added both holiday feeds, created the blend, got a working feed URL — merged 59 events from 2 sources, no crash, no data loss.
- **Prefix spacing:** FIXED. Set prefix `[US] ` and the real feed output is `SUMMARY:[US] New Year's Day` — clean single space, not jammed.
- **Privacy copy honesty:** FIXED/honest. Footer now says source URLs are encrypted into the link and fetched server-side on refresh, "never stored persistently" — matches what I'd expect, no overclaim.
- **Recall UX (my round-2 flag):** LARGELY LANDED. "Your recent blends" now shows the nickname as the prominent editable field with the URL demoted to small grey text. I typed "Holidays merged," reloaded, and it PERSISTED (device-local). That's exactly the fix I wanted — I can finally tell which link is which.

## What still nags
- The promised **"Copied!" cue did NOT fire** for me. Clicking "Copy URL" did copy the full feed URL to my clipboard (verified — copy works), but the button label stayed "Copy URL" through 1.4s of watching. Copy is functional; the confirmation feedback isn't visible. Minor, but it's the one thing the round-3 notes said was added that I couldn't see.
- Mask + global filter both verified correct in the real feed (masked feed = 36 "Busy" entries, all visible titles contain my keyword). Mobile (375px) result + preview render cleanly.

## Why 8 and not 9
The recall fix genuinely moved me up from round 2 — this is now a tool I'd actually use weekly and mention to other community marketers. It loses the 9th point on the missing per-feed keyword filter (my core motivation) and the invisible copy cue. Fix per-feed keyword filters and this is a 9 I bring up unprompted in my Discord.

```json
{"tester": 4, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No per-feed keyword filter — include/exclude is global only, can't keep-only-X from one feed", "'Copied!' cue never appeared on Copy URL (copy itself works)"], "priorConcernsAddressed": "all"}
```
