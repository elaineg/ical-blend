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
Calm, trustworthy, technical-but-friendly — this handles people's private schedules. Neutral
sans-serif (system UI / Inter), cool neutral grays with one confident accent for actions,
generous spacing (roomy form rows, no cramped controls). It should feel like a quiet utility
that did exactly what you asked.

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
- **Each feed row gets its own "Options" disclosure, always visible from cold load.** Render a
  small, low-key per-row affordance (a text/disclosure toggle labelled "Options", an inline
  triangle/▸ caret) directly under or beside every source-URL input — on EVERY row, including
  empty ones (do NOT gate it on the URL being filled: optional-ui-gated-on-data-presence).
  Default collapsed. The row stays a clean URL field by default so the 5-second story
  ("paste feeds → get one URL") is untouched at 2–5 feeds.
- **Expanding "Options" reveals three optional per-feed controls**, stacked, indented under
  that feed's URL so the grouping is obvious:
  1. **Title prefix** — short text input, label "Label added to this feed's event titles",
     placeholder e.g. `[Work] `. Prepended verbatim to every event title from this feed only.
  2. **Mask this feed's titles** — checkbox. Crucially NOT labelled "Busy-only" (that lexeme is
     reserved for the global control); helper text: "Show this feed's events as 'Busy', keeping
     other feeds detailed." This is a per-feed override of the global mask.
  3. **Hide all-day events from this feed** — checkbox; helper: "Drop birthdays/holidays and
     other all-day items from this feed."
- **Global vs per-feed legibility.** Keep the global keyword filters + global "Busy-only privacy
  mask" exactly where they are. Add one quiet line under the global mask: "Applies to all feeds.
  Need it for just one? Use a feed's Options." So the two masks read as scope levels, not as a
  duplicated/broken control.
- **A configured feed signals itself.** When a feed has any per-feed option set, keep its
  "Options" affordance showing a subtle "on" state (e.g. "Options · on" or a filled caret) so the
  user knows config is applied even while collapsed — no silent state.
- **Preview reflects per-feed rules (flow 3).** The ~10-event preview must show each event with
  its feed's prefix already prepended to the title, per-feed-masked feeds shown as "Busy", and
  hidden all-day events absent — so the user verifies origin labels and masks before subscribing.
  Where space allows, the preview-applied summary line may note "2 feeds labelled · 1 feed masked".
- **Purely additive / back-compat.** Per-feed options are all-optional and absent by default; an
  un-configured feed must look and behave exactly as today (never "broken"). Legacy already-
  subscribed feed URLs (token config with a plain list of source URLs, no per-feed objects) keep
  working unchanged — this feature only adds, never alters, existing behaviour.

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
- **Subtitle:** "Paste 2–5 calendar links. Get one feed. No account."
- **Primary action:** the source-URL fields (first pre-focused) + "Create feed" button.
- **Pre-filled example:** field 1 holds a real public ICS URL so the user can hit "Create feed"
  immediately and see a working merged result.
