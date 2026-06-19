# Round 2 — Dana (Demand-gen marketer, medium tech, ruthless about time)

Job attempted: merge my webinar calendar + a HubSpot campaign-milestone feed (+ a holidays
feed) into one feed I'd subscribe to on my phone. Used cold via headless Chromium, 1280px.

## Verdict
- **(a) Advocate to a peer: 8/10.** I'd screenshot this into the team channel. It does the
  exact thing I want — many ICS links in, one subscribe-able link out, no signup, free —
  and the per-feed prefix + privacy mask are genuinely thoughtful for a marketing team.
  Not a 9 because of two friction points below.
- **(b) Purpose clear in 5s: YES.** Headline "One feed from all your calendars — work,
  personal, or team" + subline "Paste 2–5 calendar links. Get one subscribable feed. No
  account." told me everything before I scrolled. Value obvious in ONE scroll: yes.
- **(c) Valuable to me: YES.** Today I have a Luma/webinar .ics and HubSpot milestones in
  two separate subscriptions and juggle both on my phone calendar. This collapses them into
  one feed I subscribe to once. That's real recurring time saved.

## Did I find PER-FEED keyword filters AND the active-filter badge cold? **YES.**
- Each feed row has a "Options & filters" disclosure with the micro-hint
  "prefix · keyword filter · mask" — I knew what was inside before clicking. Opened it,
  found Include (`piano, soccer`) / Exclude (`standup, lunch`), a `[Work]` prefix label,
  per-feed mask, and hide-all-day. Set Include = "webinar".
- Collapsed the row and the **active-filter badge is unmistakable**: the disclosure relabels
  to "Options & filters · on" with subtext "include: webinar · prefix". I knew at a glance
  which feeds I'd touched. This is exactly the affordance I'd want.
- GLOBAL filter ("Only include events containing") is right there in the main column with a
  clear note that per-feed overrides exist. Set it to "launch"; result correctly said
  "Only events matching 'launch'."

## What I'd subscribe to on my phone
Create feed produced both an https Feed URL and a `webcal://` URL (each with Copy), an
"Add to Google Calendar" button, and subscribe steps for Google/Apple/Outlook. Caption is
honest: "Anyone with this link can read your merged calendar; treat it like a password."
I confirmed the feed endpoint serves real `text/calendar` (HTTP 200). Good.

## What holds it back (the 2 points off)
1. **Generated link is monstrously long** (~400 chars, encrypted source URLs). I understand
   *why* (no DB, URLs encrypted into the link), and the copy explains it — but pasting that
   into Apple Calendar on my phone feels fragile and un-screenshottable. A short alias or QR
   for phone subscribe would close the loop on the actual "on my phone" promise.
2. **Real-world fetch failures look scary.** Two of my sources returned "HTTP 400 — source
   rejected the request" / "fetch failed". It degraded gracefully (kept the working source,
   said it'd retry), which I appreciate — but HubSpot/Outlook ICS auth quirks mean a real
   user may see this on legit feeds and not know if it's their fault or the tool's. A hint
   like "private feeds need their secret-address .ics" would help.

Minor: clipboard read was blocked in my test env (copy verified visually; the Copy buttons
are present and labeled). Not a product bug.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Subscribe link is ~400 chars — fragile to paste/screenshot on a phone, undercuts the 'on my phone' promise", "Feed-fetch errors (HTTP 400 / fetch failed) on real private feeds could read as the tool's fault with no fix hint"], "priorConcernsAddressed": "n/a"}
```
