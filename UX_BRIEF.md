# iCal Blend — UX Brief

## 1. Problem statement
Stop checking three calendars: blend your work, personal, and shared calendars into one
link you subscribe to once — and hand others a version with the private titles hidden.

## 2. Primary user action
Build a merged feed. The landing view is the builder itself, with the first source-URL field
pre-focused and a real example feed URL pre-filled (a public holidays ICS) plus a faded
placeholder second field, so a cold visitor sees the shape of the result before typing.
"Create feed" is the single prominent button.

## 3. Emotional tone
Calm, trustworthy, exacting — this handles people's private schedules, so it must read as a
precise instrument. Conform to the house SSENSE system (`lib/design-system/ssense.md`):
monochrome ink/paper/grey only, one neutral grotesque (Helvetica Neue → Archivo/Inter),
hierarchy from size/weight/case/tracking — NOT color. Tiny UPPERCASE tracked micro-labels
(STATUS, PREVIEW, KEPT), 1px hairline rules instead of cards/shadows, square corners,
generous whitespace. The only functional color is `--red` (text only) for fetch failures and
form errors; success is an ink ✓, never green. It should feel like a quiet, austere utility
that did exactly what you asked and showed its work.

## 4. Design decisions (addresses round-1 friction A, D, E, F)
- **Copy confirms inline (A).** Every copy control (feed URL and webcal:// URL) swaps to
  "Copied!" with a check on click and reverts after ~2s. No silent copies — this hit both
  lowest scorers.
- **Create-time validation + confirmation, never silent (D/F).** Empty/malformed/
  localhost/link-local/non-http(s) URLs show an inline message under the offending field on
  submit; the message clears the moment the field is corrected or resubmitted (no orphaned
  stale errors). On success show a confirmation banner: "Merged N events from M sources."
  Any source that failed to fetch is listed visibly here at build time (not buried in the
  feed). A single valid source is allowed but the confirmation says so explicitly:
  "Built from 1 source — add more anytime."
- **One-tap add + all major clients (E).** The result screen leads with a prominent
  "Add to Google Calendar" button (one tap, uses the feed URL). Below it, equal-weight
  subscribe instructions for Apple Calendar, Outlook / Office 365, and Google.

## 4b. Per-feed rules (advanced merge — this iteration)
- **Each feed row gets its own "Options & filters" disclosure, always visible from cold load.** Render a
  small, low-key per-row affordance (a text/disclosure toggle labelled "Options & filters", an inline
  triangle/▸ caret) directly under or beside every source-URL input — on EVERY row, including
  empty ones (do NOT gate it on the URL being filled: optional-ui-gated-on-data-presence).
  Default collapsed. On the collapsed row, show a "prefix · keyword filter · mask" micro-hint
  so cold users know filtering lives there; when any option is active, show an inline badge
  summarising the first active setting(s). The row stays a clean URL field by default so the
  5-second story ("paste feeds → get one URL") is untouched at 2–5 feeds.
- **Expanding "Options" reveals four optional per-feed controls**, stacked, indented under
  that feed's URL so the grouping is obvious:
  1. **Title prefix** — short text input, label "Label added to this feed's event titles",
     placeholder e.g. `[Work] `. Prepended verbatim to every event title from this feed only.
  2. **Mask this feed's titles** — checkbox. Crucially NOT labelled "Busy-only" (that lexeme is
     reserved for the global control); helper text: "Show this feed's events as 'Busy', keeping
     other feeds detailed." This is a per-feed override of the global mask.
  3. **Hide all-day events from this feed** — checkbox; helper: "Drop birthdays/holidays and
     other all-day items from this feed."
  4. **Keywords (this feed only)** — a labelled SUB-GROUP holding TWO co-located text inputs,
     "Include" and "Exclude", side-by-side on desktop and stacked at 375px. Mirror the GLOBAL
     keyword fields' labels/placeholders verbatim (e.g. Include placeholder "piano, soccer",
     Exclude placeholder "standup, lunch") so the per-feed pair is instantly recognised as the
     same kind of control, just scoped. Sub-group heading: "Keywords — this feed only".
     Helper under the pair: "Only this feed's events are filtered. These ADD to the global
     keyword filters above — an event must pass both." Same comma-separated parsing as the
     global fields. The two inputs MUST render and be usable at 375px in build #1
     (new-affordance-must-render-at-375px); never split the pair across separate rows/sections
     (two-related-controls-split).
- **Global vs per-feed legibility.** Keep the global keyword filters + global "Busy-only privacy
  mask" exactly where they are. Add one quiet line under the global mask: "Applies to all feeds.
  Need it for just one? Use a feed's Options." So the two masks read as scope levels, not as a
  duplicated/broken control. Likewise add a quiet line under the global keyword fields:
  "Applies to all feeds. Want different keywords per feed? Use that feed's Options." The
  per-feed keyword pair must be visually distinct from (and clearly subordinate to / scoped
  under) the global keyword fields so a user never mistakes one for the other or wonders why a
  globally-excluded term still needs a per-feed rule — they compose, they don't replace
  (addresses added-feature-buried, seen 14x).
- **A configured feed signals itself.** When a feed has any per-feed option set, keep its
  "Options" affordance showing a subtle "on" state (e.g. "Options · on" or a filled caret) so the
  user knows config is applied even while collapsed — no silent state.
- **Preview reflects per-feed rules (flow 3).** The ~10-event preview must show each event with
  its feed's prefix already prepended to the title, per-feed-masked feeds shown as "Busy",
  hidden all-day events absent, AND per-feed keyword filtering already applied (events dropped
  by a feed's own include/exclude rule are absent from the preview) — so the user verifies
  origin labels, masks, and filters before subscribing.
  Where space allows, the preview-applied summary line may note "2 feeds labelled · 1 feed masked".
- **Purely additive / back-compat.** Per-feed options are all-optional and absent by default; an
  un-configured feed must look and behave exactly as today (never "broken"). Legacy already-
  subscribed feed URLs (token config with a plain list of source URLs, no per-feed objects) keep
  working unchanged — this feature only adds, never alters, existing behaviour. Per-feed
  option objects from before this feature that LACK the new keyword fields must merge
  byte-for-byte identically (empty/absent keyword fields = no filter).

## 4c. Preview & test your feeds (THIS iteration — promote preview to PRE-create + enrich)
The existing post-create preview is PROMOTED to run while the user is still configuring, and
ENRICHED with per-source status + a reconciliation count. There is ONE preview, one merge
model — do not build a second parallel preview.

- **"Preview merged calendar" action — always available while configuring.** A full-width
  secondary (outline, square, uppercase 11px tracked) button directly below the form controls
  and ABOVE the "Create feed" button. It is operable BEFORE any subscribe URL exists. Tap
  target ≥44px tall; renders and works at 375px in build #1 (added-feature-buried). Clicking
  it fetches all source feeds live via the SAME server endpoint/merge pipeline the served feed
  uses — pass the current config to a preview route that calls the identical
  fetch→merge→filter→mask code path and returns {perSource:[{label,ok,count,reason}], fetched,
  kept, events:[…15]}. The preview MUST be byte-faithful (sibling-symmetry / trust-is-fake-if-
  forked): a builder must NOT reimplement filtering/masking for the preview.
- **The preview panel (renders below the button, vertical stack, mobile-first).** Three zones,
  each separated by a 1px `--grey-200` hairline, in this order:
  1. **PER-SOURCE STATUS list** — micro-label heading "STATUS". One row per source, stacked
     full-width (never a wide table that overflows 375px). Each row: source label/prefix (or
     the URL host if unlabelled) on the left; on the right a status token:
     - ✓ alive: ink ✓ + "N events" in `--grey-600`.
     - ✗ failed: `--red` ✗ + a human reason (text only, no fill) — map causes to plain
       language: timeout → "timed out", 404/4xx → "feed not found (404)", 401/403/auth →
       "needs a login — not a public feed", non-ICS body → "not a calendar feed", parsed-but-
       zero → "empty feed (0 events)". Reason must be visible inline at 375px, NO hover.
  2. **RECONCILIATION COUNT** — a prominent single line, larger weight (h3/16px), reading
     "Fetched X events → kept Y after filters & mask". X = sum of per-source ✓ counts; Y =
     rendered merged/deduped kept count. This is the trust core — make it the most legible
     thing in the panel. If Y < X, optionally append a quiet `--grey-600` note "(N removed by
     filters/mask)". HONEST INSTRUMENT: the numbers come from the real merge result, never an
     estimate.
  3. **PREVIEW list** — micro-label heading "PREVIEW · NEXT 15". The next ~10–15 upcoming
     events chronologically; each row: date/time (left, tabular-nums, `--grey-600`), then
     title showing its feed prefix prepended, masked feeds rendered as "Busy", and a small
     source label. All-day-hidden, per-feed/global keyword-excluded events are ABSENT (they
     went through the real pipeline). Rows are hairline-separated, left-aligned.
- **Explicit empty / partial / all-failed states (design them — a lying count is worse than
  none):**
  - **0 sources entered:** the "Preview merged calendar" button is disabled (grey-400 per
    SSENSE disabled spec) with helper "Add a feed URL to preview." No panel, no fake zero.
  - **All sources failed:** show the STATUS list with every row ✗ + reason, replace the
    reconciliation line with "No feeds could be fetched — check the URLs above," and show NO
    preview list (not an empty box implying 0 real events).
  - **Filters drop everything to 0 kept:** STATUS shows ✓ counts, reconciliation reads
    "Fetched X events → kept 0 after filters & mask," and in place of the preview list show
    "0 kept — your filters removed every event. Loosen a keyword or mask above." (say what to
    do next).
  - **Partial (some ✓, some ✗):** all rows shown with their real status; reconciliation X
    counts only the ✓ sources; a quiet line "1 source failed — its events are not included."
- **"Load a sample feed" — cold-start on-ramp (Elena's gap).** A tertiary/text button
  ("Load a sample feed", uppercase label, ink underline on hover) near the top of the builder,
  visible on a cold/empty page. One click populates the config with a WORKING example so a
  visitor sees a populated merge + preview before pasting private links. SAMPLE CONFIG to
  specify to the builder: source 1 = a public US Holidays ICS
  (`https://www.gov.uk/bank-holidays/england-and-wales.ics` or an equivalent stable public
  holidays ICS the builder verifies returns 200), labelled prefix "[Holidays] "; source 2 = a
  second stable public ICS (e.g. a public sports/phases-of-the-moon ICS) labelled "[Personal] "
  with the global busy mask OFF — chosen so the preview clearly shows two distinct labelled
  sources merging chronologically. After loading, the user can immediately hit "Preview merged
  calendar" and see ✓ ✓ status, a real reconciliation count, and a populated event list.
  (Builder MUST confirm both sample URLs return 200 ICS at build time; if one is unreliable,
  swap for another public ICS — never ship a sample that previews as ✗.)
- **Re-shown after Create.** After "Create feed", the SAME preview panel (status +
  reconciliation + events) remains/reappears under the result so the post-create confirmation
  story (4-craft notes, result-screen order) is unchanged — it is the same component, not a
  second one.

## 5. Craft notes (Aisha — product designer)
- **Empty state:** the pre-filled example IS the empty state — never a blank box. The preview
  area shows "Your merged events will appear here" with the example's upcoming events once built.
- **Error-state copy tone:** say what to do next, calm not scolding — "That doesn't look like a
  calendar feed URL (needs to start with https:// or webcal://)" not "Invalid input."
- **Result-screen layout:** confirmation banner first (count + any failures), then the big
  "Add to Google Calendar" action, then the copyable URLs with their "Copied!" buttons, then
  the upcoming-events preview last. One clear vertical priority order.
- **Result-quality expectations (builder logic, not UI):** the preview and merged feed must be
  deduplicated across overlapping sources (B), and under the busy-only mask no source identity
  leaks via UID (C). The preview should reflect deduped results so the event count is trustworthy.

## 6. 5-second check (above the fold)
- **Headline:** the problem statement above.
- **Subtitle:** "Paste 2–5 calendar links. Preview & test them, then get one feed. No account."
- **Primary action:** the source-URL fields (first pre-focused) + "Preview merged calendar"
  (test first) above "Create feed". A cold visitor reads "test your feeds before you subscribe"
  immediately.
- **Pre-filled example / on-ramp:** field 1 holds a real public ICS URL, and a visible
  "Load a sample feed" button populates a full two-source example so a cold visitor can hit
  "Preview merged calendar" and see ✓ status + a reconciliation count + a populated event list
  before pasting anything private.
