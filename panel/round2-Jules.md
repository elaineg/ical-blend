# ical-blend — Round 2 — Jules (Content & community marketer, medium-tech, 50/50 desktop/mobile)

Motivation: merge my Discord/Luma/newsletter community ICS feeds into one keyword-filtered,
subscribe-able feed — and refuse to log in for a job this small.

## Re-check of MY round-1 complaints
1. "Collapsed per-feed filters get missed / no visible active-filter signal" — FIXED. After I
   set per-feed Include="Regional" and collapse the row, feed 1 now shows a highlighted blue
   `Options & filters · on` plus an inline `include: Regional` chip; feed 2 stays neutral
   (`prefix · keyword filter · mask`). I can SEE which feed is filtered without expanding. Big.
2. "No pre-Create test/validate feed — dead/auth-gated Discord/Luma feeds fail silently" —
   NOT addressed. Still no "test this feed" button before Create. Mitigated (not solved) by the
   post-Create "313 events from 2 sources" caption + "Preview — exactly what subscribers see"
   list, which tells me each source contributed — but I learn a dead feed only AFTER creating.

## What I did (cold-ish, round 2)
Pasted officeholidays USA + Google USA-holidays ICS. Opened feed-1 Options, set per-feed
Include="Regional", collapsed it (saw the new `· on` + `include: Regional` badge), set GLOBAL
Exclude="Eve", Create feed. Subscribe-as test: fetched the generated /api/feed/<token> → HTTP
200, 313 VEVENTs, ZERO "Eve" titles (global exclude honored), feed 1 reduced to "Regional
Holiday" titles only while feed 2 untouched. AND-composition is honest end-to-end. Got http +
webcal + "Add to Google Calendar" links with Copy buttons, per-platform subscribe steps, and a
subscriber-accurate preview. No console/page errors.

## (a) Advocacy: 9/10
Last round 8. The active-filter badge is the exact fix that pushes this to a 9 — the per-feed
vs global model is now legible AT A GLANCE, not just on a careful read. It's the free, no-login
ICS merger+filter I've wanted, the preview earns my trust to publish it, and the copy is tighter.
Held off 10 only because there's still no pre-Create feed reachability check, so an auth-gated
Luma/Discord token feed could silently contribute zero and I'd only catch it in the preview count.

## (b) Clarity within 5 seconds: Yes
"One feed from all your calendars" + "Paste 2–5 calendar links. Get one subscribable feed. No
account." The "No account" is what makes me try it. The `prefix · keyword filter · mask` hint on
each row now tells me filtering is per-feed before I even click.

## (c) Value: Yes
Today I subscribe to 4 community feeds separately and mute the noise, or paste links into a
login-walled aggregator. This merged + keyword-filtered in one session, zero signup, real webcal
link. Saves meaningful effort and the keyword filter is exactly my use case.

## Per-feed keyword filters AND active-filter badge found COLD: Y
Found both. `Options & filters` discloses "Keywords — this feed only" Include/Exclude with
`piano, soccer` / `standup, lunch` placeholders and "These ADD to the global filters — an event
must pass both." Collapsed badge `Options & filters · on` + `include: Regional` confirmed visually.

## Top blockers
1. Still no pre-Create "test this feed" — auth-gated/dead community feeds fail silently until preview.
2. Minor: webcal://localhost link is a local artifact; on prod I'd want the webcal host to be obvious.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Still no pre-Create feed reachability/test — auth-gated or dead community feeds contribute 0 silently, caught only in post-create preview count", "No way to confirm a token-gated Luma/Discord feed authenticated before subscribing"], "priorConcernsAddressed": "some"}
```
