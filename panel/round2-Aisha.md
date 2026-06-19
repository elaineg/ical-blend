# Round 2 — Aisha (Product designer, judges craft hard)

**Advocacy: 9/10** · Clarity: Yes · Value: Yes
**Found per-feed keyword filters + active-filter badge cold: YES**

## (b) Purpose clear in 5s? YES
H1 "One feed from all your calendars — work, personal, or team" + the sub "Paste 2–5
calendar links. Get one subscribable feed. No account." told me exactly what it does and
that there's no signup. The "Source feeds (ICS / webcal URLs)" label and pre-filled
example placeholders made the first action obvious. No hunting.

## (c) Valuable? YES
Today I stitch my Google + partner's shared + kids'-school ICS by manually subscribing to
each in Apple Calendar and color-juggling — and I can't filter or relabel them. This gives
me ONE link, per-feed prefixes ("[Kids] "), per-feed keyword filters, and a busy-only
privacy mask for the shared version. The green result banner "21 events from 2 sources …
Only events matching 'holiday'" + a live Preview of the actual merged events sold me — I
could verify the filter worked before subscribing. That's the considered touch I look for.

## Per-feed filters + badge (the ask)
- "Options & filters" disclosure with micro-hint `prefix · keyword filter · mask` reads
  clearly — it previews what's inside without me clicking. Good.
- Opened it cold, found: feed prefix, mask-titles, show-as-Busy, hide all-day, and per-feed
  Include/Exclude keywords. The copy "Only this feed's events are filtered. These ADD to
  the global keyword filters above — an event must pass both" is precise and answers the
  exact question I'd have. Considered.
- Active-filter badge WORKS: after setting prefix+keyword and collapsing, the row label
  flips to indigo "Options & filters · on" with a summary "include: recital · prefix",
  while the untouched feed stays muted gray "prefix · keyword filter · mask". Great
  at-a-glance state; the color/weight contrast draws the eye correctly.
- Global "Only include / Exclude events containing" present, with a helpful cross-link
  "Want different keywords per feed? Use that feed's Options & filters."

## Caption / copy / spinner
- Subscribe caption is honest and well-pitched: "Your private subscribe link — paste it
  into Google Calendar, Apple Calendar, or Outlook to subscribe. Anyone with this link can
  read your merged calendar; treat it like a password." The deeper privacy note even admits
  URLs "do transit the server" — trustworthy, not over-claiming.
- Copy button works (label → "Copied!", clipboard verified). Add-to-Google button, webcal
  link, and per-app subscribe instructions all present.
- Empty state: clicking Create with no URL shows "Add at least one calendar feed URL to get
  started." — friendly, actionable.
- Partial-failure state: when one source 404s, a yellow banner says "1 source could not be
  fetched" and counts only what merged. Honest error craft — rare and appreciated.

## What holds it back from 10 (craft nits)
1. **Create spinner is too subtle.** A `.animate-spin` element exists mid-request, but the
   button text stays "Create feed" and looks identical to idle. As a designer I want the
   button to read "Creating…" / disable + show the spinner IN the button so there's zero
   ambiguity. Right now a slow fetch looks like nothing happened.
2. The success banner, instructions, and "recent blends" stack into a long scroll with no
   visual hierarchy break between "your link" and "how to subscribe" — a card boundary or
   step numbering would help the eye.
3. Feed-URL field shows a raw 200-char opaque token; fine functionally, but visually noisy.
   Minor.

None are blockers. The flow is genuinely considered — empty states, micro-hints, honest
error/privacy copy, and the active-filter badge are exactly the details a clumsy tool skips.
I'd bring this up to a peer unprompted; the subtle spinner is the only thing keeping it off a 10.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Create spinner too subtle — button text stays 'Create feed', slow fetch looks like nothing happened", "Result page is a long undifferentiated scroll; needs card/step hierarchy between link and instructions"], "priorConcernsAddressed": "n/a"}
```
