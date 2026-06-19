# ical-blend — Panel SYNTHESIS Round 2

App: http://localhost:3022 — merge multiple .ics feeds into one subscribe-able feed.
Round-2 change: SURFACING + TRUST fix — "Options & filters" disclosure relabel + micro-hint
(`prefix · keyword filter · mask`) + inline active-filter badge on collapsed rows; "Your private
subscribe link — paste it into Google/Apple/Outlook" caption above the URL; spinner on Create.
Global landing-surface change → all 10 re-tested cold (no carry-forward).

## Per-persona verdicts (all 10 in-audience)

| Name   | Adv | Clarity | Value | Found filters+badge cold | Top blocker |
|--------|-----|---------|-------|--------------------------|-------------|
| Priya  | 8   | Y       | Y     | Y | Subscribe link embeds source URLs (incl. authed tokens) — no "treat like a password" warning prominent enough; no 1-click add-to-Google |
| Marcus | 9   | Y       | Y     | Y | Privacy caption ("URLs transit the server") makes him hedge before Slacking a private-calendar rec; ~300-char raw token URL looks alarming |
| Wen    | 8   | Y       | Y     | Y | No "fetched X → kept Y" drop count / per-source fetch status — can't prove zero silent loss without grepping the .ics |
| Tomás  | 8   | Y       | Y     | Y | "URLs transit the server" blocks handing a truly internal feed without IT sign-off; wants client-side/self-host mode → 9 |
| Dana   | 8   | Y       | Y     | Y | ~400-char subscribe link fragile to paste/screenshot on phone; private-feed fetch errors read as the tool's fault |
| Jules  | 9   | Y       | Y     | Y | No pre-Create "test this feed" — a dead/auth-gated feed contributes 0 silently, caught only post-create |
| Aisha  | 9   | Y       | Y     | Y | Create spinner too subtle — button text stays "Create feed", looks identical to idle; should say "Creating…" + disable |
| Rob    | 8   | Y       | Y     | Y | Failed-source run bakes "X sources failed" into the calendar TITLE a client sees; no way to name output calendar |
| Elena  | 8   | Y       | Y     | Y | No sample/demo feed to see a real populated merge before pasting private links; no word on link lifetime |
| Sam    | 8   | Y       | Y     | Y | ~180-char opaque token isn't a "clean shareable link" — undercuts the share-it motivation; privacy caption gives pause |

## Audience-weighted verdict

- **In-audience-at-9 count: 3/10** (Marcus 9, Jules 9, Aisha 9). The other 7 sit at 8 — none below 8.
- **Discoverability: RESOLVED.** 10/10 found the per-feed keyword filters AND the active-filter
  badge cold, up from round 1's ~4/10. The "Options & filters" relabel + micro-hint + inline
  active-filter badge fully closed the round-1 discoverability ceiling. Clarity 10/10, value 10/10.
- **VERDICT: NEEDS-FIX.** PASS bar (all 10 at adv≥9) not met — 7 in-audience personas held at 8.

## Most-cited remaining fixable blocker

**Subscribe-link trust/shape** is the dominant theme (6 of 10: Priya, Marcus, Dana, Tomás, Sam,
+ Rob adjacent). Two intertwined facets:
1. **Long opaque token + "URLs transit the server"** — the ~180–400-char link that embeds source
   URLs reads as alarming/unshareable and makes privacy-sensitive personas (Tomás, Marcus, Sam,
   Priya) hedge before recommending or pasting a private/client calendar. A shorter link and/or a
   more reassuring, prominent "treat like a password" + data-handling cue is the single highest-
   leverage 8→9 move.
2. **Silent partial-merge on a failed/dead source** (Wen, Jules, Rob, Dana, Elena touch this) —
   no pre-Create feed test and no "fetched X → kept Y / source N failed" count visible in the
   product (only baked into the title, which Rob flags as a client-facing leak). A visible
   per-source fetch-status + kept-event count would convert several 8s.

Lower-leverage one-offs: Aisha's too-subtle Create spinner (cheap, real), Elena's missing
sample/demo feed, Rob's output-calendar naming.
