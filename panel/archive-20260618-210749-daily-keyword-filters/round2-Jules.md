# Round 2 — Jules (Content & community marketer)

(a) Advocacy: **8/10**
(b) Value clear in <30s? **Yes** — "Stop checking three calendars / Paste 2–5 calendar links. Get one feed. No account." nailed it before I scrolled. The "hand others a version with the private titles hidden" line told me about masking instantly.
(c) Biggest remaining blocker: **The recall list de-emphasizes the nickname I just set.** After reload, each entry leads with a giant opaque `/api/feed/...` URL; the nickname lives inside an editable text box, so when one entry is named ("Community events feed") and one is blank, I'm still scanning two near-identical URL blobs to tell them apart. Make the nickname the row's HEADING (bold, big) and collapse the URL to a tiny tail — then the list reads at a glance.

## Prior concern (round 1: couldn't tell which opaque link is which / re-copy it)
**Addressed — mostly.** I made two blends, nicknamed one, reloaded: both persisted device-local, my nickname survived, and the per-row "Copy URL" button re-copied the full link to clipboard (verified). That was my dominant 8→9 lever and it's no longer a dead end. It lands at "works" rather than "delightful" only because of the layout nit in (c) — the nickname should be the thing my eye hits first, not a faint input below the URL.

## Fresh take (real workflow: Discord/Luma/newsletter ICS feeds → one filtered feed)
- Merged US + Canada holiday ICS for real. Worked. Preview showed live events.
- Per-feed prefix worked: "US Juneteenth", "US Independence Day" carried my "US " label.
- Masked feed showed multiple distinct "Busy" rows on different dates — NOT collapsed, no real title leaked. Round-1 privacy bug is gone.
- Bad feed gave "Feed 2 — HTTP 404 — feed URL not found" and still built from the good source. The silent-hang fear is dead — this is the behavior I'd want.
- Summary "2 sources · 1 feed labelled · 1 feed masked" is a lovely trust receipt.
- Privacy note ("encrypted, self-contained, nothing stored server-side") is exactly what disarms my no-login allergy.

Why not 9: the per-row "Copy URL" gave no "Copied!" confirmation (clipboard did get the link, but a marketer firing off links fast wants the visual tick), and the nickname-buried-under-URL layout means recall still takes a beat of squinting. Fix those two and I'd bring this up unprompted in my Discord mod channels.

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Recall list leads with the opaque URL, not the nickname — make the nickname the bold row heading and shrink the URL to a tail", "Per-row 'Copy URL' gives no 'Copied!' confirmation (clipboard write succeeds but no visual tick)"], "priorConcernsAddressed": "all"}
```
