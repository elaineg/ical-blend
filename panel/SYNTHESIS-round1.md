# ical-blend — Panel Round 1 Synthesis

Feature under test: per-feed keyword filters (Include/Exclude) inside each feed's collapsed
"Options" disclosure, composing AND with global include/exclude. Cold-use, 10 personas,
local prod http://localhost:3022.

## Verdict table

| Persona | Role | Adv | Clarity | Value | Top blocker |
|---------|------|-----|---------|-------|-------------|
| Priya | Senior backend eng | 8 | Yes | Yes | Opaque encrypted-token URL has no "anyone with link" / expiry warning; rename "Options" to "Options & filters" |
| Marcus | Frontend eng | 8 | Yes | Yes | Per-feed Options buried behind forgettable toggle; "Creating…" hangs with no spinner |
| Wen | Marketing data analyst | 9 | Yes | Yes | Per-feed filters discoverable only via prose, no visible badge; no plain export of merged event list |
| Tomás | Ops analyst | 8 | Yes | Yes | Substring (not word-boundary) matching over-matches ("Day"→"Holiday"); residual caution pasting internal URL |
| Dana | Demand-gen marketer | 8 | Yes | Yes | Per-feed filters buried in collapsed Options; no sample/try-it feed |
| Jules | Content/community marketer | 8 | Yes | Yes | No "test/validate feed" before Create; dense helper copy |
| Aisha | Product designer | 8 | Yes | Yes | Per-feed filters one-helper-line from invisible; raw URL blobs read clumsy |
| Rob | Freelance brand designer | 8 | Yes | Yes | Feed URL opaque blob, no test/refresh/last-sync cue; refresh cadence unstated |
| Elena | Engineering manager | 8 | Yes | Yes | Per-feed filters hidden behind vague "Options" label; long form heavy on mobile |
| Sam | Product manager | 8 | Yes | Yes | Feed URL looks truncated vs actual token (trust); calendar-only inputs |

## In-audience set

In-audience = personas who genuinely juggle/merge MULTIPLE calendar feeds and consult a
merged feed regularly. That is effectively ALL 10 here — every persona's motivation is a
real multi-feed merge job (on-call+release+personal, GitHub+GCal+meetup, campaign+dbt+
personal, work+facilities, webinar+HubSpot, several community feeds, family feeds, several
client booking feeds, on-call+recruiting+personal, Asana+release+personal). No pure
single-calendar or low-recurrence non-fit exists in this roster — the profiles were written
for this app. So the in-audience set = all 10, and none are non-gating.

## In-audience-at-9 count: 1 / 10

Only Wen advocates at adv≥9. The other 9 in-audience personas land at adv 8. Every one
confirmed clarity Yes + value Yes and verified the feature works end-to-end (per-feed AND
global filters compose correctly, real HTTP feed, 0 console errors). The gap to 9 is
consistently a polish/trust/discoverability ceiling, not function.

## Single most-cited fixable blocker

DISCOVERABILITY of the per-feed keyword fields — the "added-feature-buried" failure mode
(15th occurrence). 7 of 10 explicitly flagged that the per-feed Include/Exclude fields live
inside a collapsed, vaguely-labeled per-feed "Options" disclosure and are essentially
invisible cold (Marcus, Wen, Dana, Aisha, Elena named it as their #1; Priya, Rob named the
label/signpost dependency). This is a SURFACING problem, not a function failure: all 10 DID
ultimately find the fields and all confirmed they work — but findability is load-bearing on
a single quiet helper line ("Want different keywords per feed? Use that feed's Options").
Found-cold tally: ~4 found them genuinely cold (Priya, Tomás, Sam, plus Jules via the
helper); the rest (Marcus, Wen, Dana, Aisha, Elena, Rob) reached them ONLY because that
forward-reference helper line pointed them in — remove that line and the feature is buried.

Recommended fix: surface per-feed filtering on the Options summary itself — e.g. rename to
"Options & filters", add an inline keyword affordance/badge on the collapsed row, and show
"Options · on" / active-filter state when set (already exists when on; needs to advertise
availability when off).

## Result: NEEDS A FIX ROUND

In-audience-at-9 = 1/10, below the PASS bar (every in-audience persona at adv≥9). Fix the
per-feed-filter discoverability surfacing, then re-run. The function is solid; this is a
one-defect surfacing loop with a high ceiling (9 personas one polish step from 9).
