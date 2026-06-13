```json
{"tester":10,"name":"Sam","clarity":"Yes","value":"Yes","advocacy":9}
```

# Sam (PM, mobile-heavy) — Round 2

Re-tested cold on 375px mobile. Pasted both gov.uk ICS feeds, created a feed, then curl-verified the deployed URL.

## My 3 round-1 blockers — all fixed
1. **Duplicate events in preview — FIXED.** Last round Christmas/Boxing/New Year showed twice (England+Scotland overlap). Now the preview shows each once (CHRISTMAS_COUNT=1, BOXING=1). The served feed still keeps all the real per-year occurrences (114 events, valid `text/calendar`) — so dedup is display-smart, not lossy. This was the one thing that would've made a teammate distrust my shared link, and it's gone.
2. **"Copied!" confirmation — FIXED.** Tapped Copy; label flipped from "Copy" to "Copied!" and the real feed URL landed on the clipboard (verified). On mobile I now actually know it worked.
3. **Outlook instructions — FIXED.** "Outlook / Office 365: Calendar → Add calendar → Subscribe from web → paste the Feed URL." Half my teammates live in Outlook; now they're covered alongside Google + Apple.

## Bonus that landed for me
- **"Add to Google Calendar" one-tap button** — exactly what I'd hand a non-technical teammate. No menu-digging.
- **Busy-only privacy mask + include/exclude filters** are new since round 1 and hit my real fear dead-on: I can share a blended link with private titles stripped to "Busy". The headline now even says "hand others a version with the private titles hidden." That's the share-without-oversharing thing I wanted but didn't know to ask for.

## Remaining friction (minor)
- The feed URL is a giant opaque token — fine, but on mobile the truncated field makes me lean on the Copy button entirely. Not a problem, just noting I never see the whole link.
- Still upstream of the app: I have to already own the ICS URLs (finding Asana's calendar-feed URL is the real chore). Not this tool's job, but it's why it stays a power-user share tool rather than mass-market.

## Why 9 (up from 8)
Every rough edge that made a shared link look unpolished is fixed, and the privacy mask makes it genuinely better than my workaround (I currently just paste multiple ICS links into Google one-by-one and never share them because of private titles). I'd now bring this up unprompted to other PMs. Not a 10 only because I can't get a friend over the "where do I find my ICS URL" hump from inside the app.
