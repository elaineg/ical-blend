# Round 3 — Rob (brand/visual designer, freelance)

**(a) Advocacy: 8/10**
**(b) Value clear in <30s? YES** — "Stop checking three calendars" + "Paste 2–5 calendar links. Get one feed. No account... and hand others a version with the private titles hidden." nails my exact job. The busy-only mask line + per-feed Options ("Mask this feed's titles", "Label added to this feed's event titles") tell me immediately I can share availability without leaking client names. No jargon, no signup wall.
**(c) Biggest remaining blocker:** No live preview of what the SHARED feed actually looks like before I hand the URL to a client. I had to trust the "1 feed masked" summary text; as someone whose whole worry is leaking a client name, I want to *see* "[ClientA] Busy" rows on screen (or a "preview as recipient sees it" toggle) before I copy the link. The privacy claim is now honest, but trust would jump to a 9 if I could eyeball the masked output.

## Re-check of my round-2 blocker
- **PREFIX SPACING — FIXED.** Set feed 1 prefix to `[ClientA]`, masked it, created the blend. The actual served ICS shows `SUMMARY:[ClientA] Busy` on all 27 events — exactly one space, zero double-space cases. This was my round-2 fail; it landed.
- First feed row now empty (no pre-filled junk) — fixed, confirmed.
- Per-feed Options disclosure visible and labelled clearly — confirmed.

## Did mask+prefix give me a clean share-availability artifact?
**Yes.** 65 events merged from 2 feeds; the entire US "client" feed came through as `[ClientA] Busy` with no holiday/title leakage, while the unmasked Canada feed stayed fully detailed (e.g. "Family Day", "Victoria Day") with NO prefix. That's exactly the asymmetric share I need: one client's slots masked, my other context readable. Times kept, names gone. This is the thing I'd actually paste into a new-client email.

## Round-2 → Round-3 movement
Round 2 I couldn't trust the output because the prefix spacing was broken — a malformed `[ClientA]Busy` artifact is not something I'd send a client. Now the artifact is clean and the privacy copy is honest. Solid jump. Held off a 9/10 only because I'm copying a link on faith — no on-screen recipient-view preview. As a designer I don't ship what I can't see.

```json
{"tester": 7, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No on-screen preview of the masked/shared feed before copying the link", "Have to trust 'X feed masked' summary text rather than seeing the [ClientA] Busy rows"], "priorConcernsAddressed": "all"}
```
