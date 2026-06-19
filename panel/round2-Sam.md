# Round 2 — Sam (Product Manager, mobile-heavy)

Tested cold at 375px, then drove the flow: 2-3 work feeds (Google team, Asana milestones,
Outlook), per-feed filters, global filter, Create feed, inspected the subscribe link.

## (b) Purpose clear in 5 seconds? YES
"One feed from all your calendars — work, personal, or team" + "Paste 2-5 calendar links.
Get one subscribable feed. No account." nailed it instantly. I knew exactly what this was
and that it's for someone like me merging Asana + work + personal. The "No account" was the
trust hook I look for.

## Per-feed keyword filters + active-filter badge found COLD? YES
The "Options & filters · prefix · keyword filter · mask" micro-hint under each feed row told
me filters lived there before I even clicked. Opened it, found "Keywords — this feed only"
with Include/Exclude and the helpful note "These ADD to the global keyword filters above — an
event must pass both." After typing "release"/"lunch" and collapsing, the row showed a
highlighted "Options & filters · on" pill PLUS a chip reading "include: release · exclude:
lunch". That badge is exactly the kind of at-a-glance state I want — I didn't have to re-open
to remember what I'd set. The global "Only include / Exclude events containing" fields are
right there below, also obvious.

## (c) Valuable? YES
Today I keep 3 calendars in separate tabs and manually eyeball overlaps; there's no clean way
to give a teammate "my whole world" in one link. This does the exact job — one subscribable
URL, per-feed labels so a merged event reads "[Work] Launch review", a Busy-only privacy mask,
and copy-paste subscribe steps for Google/Apple/Outlook. The "Preview — exactly what
subscribers see" panel is the detail that earns my trust before I share. It even degraded
gracefully when 2 of my placeholder feeds failed (clear "HTTP 404 / source rejected" rows,
feed still built from the rest) — that's the "just works" I won't debug for.

## (a) Advocate to a peer? 8/10
Genuinely strong. What holds it back from a 9:
1. **The link is NOT a "clean shareable link."** The Feed URL is a ~180-char opaque token. I
   share in Slack and Notion and that monster looks alarming, not organized — the opposite of
   my whole motivation. A short/branded link or a nicer "share card" would push this to a 9-10.
2. **Privacy caption gives me pause as a PM:** "your config (including source URLs) is
   encrypted into this link... but they do transit the server" + "treat it like a password."
   For a client release calendar that's a real "wait, is this safe to share?" moment. Honest,
   which I respect, but it adds friction to the exact share I'd do most.
3. Copy button worked visually (label is just "Copy"); clipboard read blocked in test env, not
   counted against the app.

Nothing here is a debug-it problem — it just worked. I'd bring it up the next time a PM
complains about juggling calendars.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Feed URL is a ~180-char opaque token — not a clean link I'd happily paste into Slack/Notion", "Privacy caption ('URLs transit the server', 'treat it like a password') makes me hesitate to share a client calendar"], "priorConcernsAddressed": "n/a"}
```
