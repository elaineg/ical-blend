# Dana — Demand-gen marketer (Round 3)

(a) Advocacy: **8/10**
(b) Value clear in <30s / one scroll: **Yes** — "Paste 2–5 calendar links. Get one feed. No account." is unmistakable in one scroll, and the whole form fits above the fold on my MacBook.
(c) Biggest remaining blocker: **Positioning is STILL personal-calendar, not marketer-facing.** The headline "Stop checking three calendars" and subhead "Blend your work, personal, and shared calendars" make me do the mental translation to my real job (webinar/event ICS + HubSpot milestone feed → one phone feed). One marketer/event-feed example line is all that stands between this and a 9.

## Prior R2 concerns — re-checked
- **R2 #1 (personal-calendar positioning):** NOT addressed. Same headline/subhead. Still the thing holding back my score.
- **R2 #2 (intimidatingly long feed URL):** Partially softened, not fixed. The URL is still a ~200-char monster string. BUT there's now a prominent **"Add to Google Calendar"** one-click button above it and a clean webcal:// + Copy, so in practice I never touch the raw string — it stings visually but doesn't block me.

## Fresh take (real run, US + Canada holiday feeds)
- Merged **65 events from 2 sources** — header literally reads "1 feed labelled. 1 feed masked." Zero console errors.
- Set `[Webinars]` prefix on US feed → confirmed 27 events came out `[Webinars] Independence Day` etc., clean spacing. Masked Canada → 38 `Busy` events, and I checked the raw feed: **zero Canada titles leaked** (no "Canada Day"/"Boxing Day" in summaries). The R2 P0 data-loss/leak fix HOLDS.
- **Copy** verified: label flips to "Copied!" and the full https feed URL lands on my clipboard. Mobile (375px) renders the result card, Add-to-Google button, subscribe instructions, and a tidy upcoming-events preview — exactly what I'd subscribe to on my phone and screenshot for the team channel.
- Privacy line ("encrypted into this link… never stored persistently, but they do transit the server") is honest and screenshot-worthy.

## R2 → R3 movement
Held at **8/10**. Data integrity, prefix spacing, masking, recall, and mobile are all solid — no regressions, the data-loss bug is genuinely gone. The score didn't move UP only because my single named R2 blocker (marketer positioning) is untouched; everything functional improved or held.

```json
{"tester": 0, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Positioning still personal-calendar (work/personal/shared) — I translate the webinar+HubSpot use case myself; one marketer example = a 9", "Raw feed URL is still a ~200-char string (Copy + Add-to-Google soften it, but it looks alarming)"], "priorConcernsAddressed": "some"}
```
