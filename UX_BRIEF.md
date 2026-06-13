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
