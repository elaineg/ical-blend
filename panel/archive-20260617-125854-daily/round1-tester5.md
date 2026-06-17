```json
{"tester":5,"name":"Dana","clarity":"Yes","value":"Yes","advocacy":7}
```

# Dana — Demand-gen marketer (medium tech, MacBook in cafes)

**Cold open:** Headline "iCal Blend" + subhead "Merge 2–5 calendar feed URLs into one
subscribable feed — with optional keyword filters and a busy-only privacy mask. No account,
nothing stored." That's one scroll, no fluff, value obvious. I stayed.

## 1. CLARITY — Yes
Five seconds in I could tell a teammate: "Paste a couple of calendar feed URLs, it spits out
one subscribe-able feed for your phone, with filters." The "Source feeds (ICS / webcal URLs)"
label, the two prefilled placeholder slots, and "+ Add another source" made the flow legible
without instructions. The "No account, nothing stored" line is exactly the trust signal I want
before pasting work URLs.

## 2. VALUE — Yes (with a real-world asterisk)
What I do today: I keep my webinar calendar in one place and eyeball HubSpot milestones
separately, then manually re-create dates in Notion. There is no good tool for "one merged
feed I subscribe to on my phone." This is genuinely that — and the keyword include/exclude
plus busy-only mask are smarter than I expected (I'd exclude internal "standup" noise, mask a
shared feed before sending it to a vendor).
The asterisk: my exact motivation was HubSpot campaign milestones + webinar feed. This only
works if those sources expose a public .ics/webcal URL. HubSpot's campaign feed and GA4 do
NOT emit ICS, so for MY two stars I'd be stuck — but my webinar platform and Google Cal do, so
it still merges most of my world. Not the app's fault, but it's the gap between "calendar
feeds" and "marketing feeds."

## What worked
- Pasted both gov.uk bank-holiday feeds, hit Create feed, got a result in ~3s.
- Got BOTH a https feed URL and a webcal:// link — webcal is the one-tap mobile subscribe I
  actually need on my phone. Good.
- Live "Preview — upcoming events / 2 sources" confirmed it really merged both calendars
  (saw Scotland's St Andrew's Day alongside England's). I trust it without subscribing.
- I curled the generated feed URL myself: it returns valid VCALENDAR ICS. It's real.
- Copy button: clipboard genuinely received the full feed URL (verified). Copy verified
  visually; works.

## Friction / bugs
- Copy button label did NOT change to "Copied" after I clicked — it stayed "Copy". Nothing
  told me it worked, so my instinct was to click again. For a ruthless one-shot user that's a
  small trust ding. (Clipboard DID receive the URL.)
- Duplicate events show twice in preview (Christmas Day, Boxing Day, New Year's appear 2x
  because both feeds share them). No dedupe. In a real merged work calendar that's clutter.
- Long feed URL is truncated in its box with no visible way to confirm the whole thing copied
  besides trusting Copy — combined with the no-"Copied" issue, it feels slightly opaque.
- Marketer reality check: nowhere does it hint where to FIND an ICS URL from my tools
  (HubSpot/Google). A one-liner "Most calendars expose this under Settings → Integrations" would
  stop me bouncing when I can't find my source URL.

## Single biggest thing to raise advocacy (7 → 9)
Make the Copy button flip to "Copied ✓" for ~2s. It's the one moment I doubted the app worked,
and for a tool whose whole payoff is "copy this link to your phone," that micro-feedback is the
difference between me screenshotting it for the team channel and quietly closing the tab. A
close second: dedupe identical events across sources.
