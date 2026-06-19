# Round 1 — Rob (freelance brand/visual designer, medium-tech, desktop)

Motivation: merge several client booking/project .ics feeds into one availability calendar,
and use a busy-only mask to share availability with a new client without leaking client names.

## (a) Advocacy: 8/10
I'd bring this up to other freelancers, but not scream about it. It does the exact job — merge
2-5 ICS links into one subscribable feed, no signup — and it nails my privacy use case with the
busy-only mask. The per-feed Options (label, mask just-this-feed, hide all-day, per-feed keyword
filters) are genuinely thoughtful and more than I expected. What holds it back from a 9: the feed
URL is a giant opaque encrypted blob — fine, but there's no "test/refresh now" or visible last-sync
status, so as someone handing this to a client I'd want proof it stays live. And nothing told me
how often it refreshes server-side. Minor, but for a "give this to my client" artifact, trust cues
matter.

## (b) Clarity: Yes
Within 5 seconds the headline "One feed from all your calendars — work, personal, or team" plus
"Paste 2-5 calendar links. Get one subscribable feed. No account." told me exactly what it is and
that it's free/no-login. The "Hide private titles from shared versions with one checkbox" line in
the intro spoke directly to my client-privacy need. Nothing confused me.

## (c) Value: Yes
Today I'd manually subscribe each client feed in Google/Apple Calendar one by one, and there's NO
clean way to hand a single sanitized availability link to a new client — I'd otherwise screenshot
my week or fake a "busy" calendar by hand. This collapses that into one link with names stripped.
That's real, recurring (I onboard clients and juggle feeds monthly+), and saves meaningful effort
over my "I could do it in Photoshop / by hand" reflex — this is something Photoshop can't do at all.

## Per-feed keyword fields — could I find them COLD?
Partially-but-yes. They are inside the collapsed per-feed "Options" disclosure, so they're hidden
on load — BUT the global keyword section has an explicit nudge: "Want different keywords per feed?
Use that feed's Options." That breadcrumb is what made me click Options and find them. Inside:
"Keywords — this feed only" with Include/Exclude (placeholders `piano, soccer` / `standup, lunch`)
and helper text "These ADD to the global keyword filters above — an event must pass both." Crystal.
I tested it for real: per-feed Include "Christmas" on feed A + global Exclude "Columbus" — output
correctly showed feed A's Christmas events + feed B's holidays minus Columbus, preview labeled
'excluding "Columbus"'. Composition (AND) works exactly as described. Without the nudge line I might
have missed per-feed fields entirely, so the nudge is load-bearing — keep it.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No 'test/refresh now' or last-sync status — handing an opaque encrypted feed URL to a client gives no trust/liveness cue", "Refresh cadence never stated; as a creator I can't tell a client how fresh the feed stays"], "priorConcernsAddressed": "n/a"}
```
