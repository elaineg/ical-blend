# iCal Blend

Purpose: For anyone juggling multiple calendar feeds — merge 2–5 ICS feed URLs into one
subscribable feed URL, with optional keyword filters and a busy-only privacy mask, no
account and no stored data.

Problem: A person juggling work + personal + kids'-school calendar feeds (or a
vacation-rental host combining Airbnb/VRBO/Booking feeds) needs them as one subscribable
calendar, consulted daily — and often needs to hand a third party a version with titles
stripped (busy-only) or noise filtered by keyword.

Beats alternative: iCalendarSync (free, no account, merge-only — no filtering or privacy
mask), FilterMyCalendar (free merge + keyword filter but account-gated, no busy mask), or
MergeCal at $2/mo. Nothing free + hosted + no-signup does merge + filter + busy-only mask.

## Core flows

1. **Build a merged feed.** On the single-page builder, paste 2–5 ICS feed URLs (http/https
   or webcal://), optionally set include-keyword and/or exclude-keyword filters (matched
   case-insensitively against event SUMMARY), and optionally toggle "busy-only privacy
   mask" (every event's SUMMARY becomes "Busy"; DESCRIPTION, LOCATION, ATTENDEE, and
   ORGANIZER are removed). Clicking "Create feed" produces the merged feed URL with a copy
   button, a matching `webcal://` variant, and one-line subscribe instructions for Google
   Calendar and Apple Calendar. The entire config (source URLs + options) is
   deflate-compressed, encrypted server-side with AES-256-GCM using a key from the
   `ENCRYPTION_KEY` env var, and base64url-encoded into a single URL path segment — nothing
   is stored anywhere.
2. **The merged feed itself (the product).** `GET /api/feed/<token>` decrypts the token,
   fetches all source feeds in parallel (timeout and size cap per source, custom
   User-Agent), merges their VEVENTs into one valid `text/calendar` response (single
   VCALENDAR, VTIMEZONEs preserved/deduped, UIDs kept or made unique across sources),
   applies the keyword filters and busy mask, and returns it with
   `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`. If one source fails
   to fetch, the remaining sources still merge and the response includes an all-day
   marker event "iCal Blend: 1 source failed" rather than erroring.
3. **Preview before subscribing.** After "Create feed", the builder page shows the next
   ~10 upcoming events from the merged result (title, date/time, which filters/mask
   applied) so the user can confirm the filters and mask did what they expect before
   copying the URL into their calendar app.

## Success checks

- Building a feed from 2 valid public ICS URLs yields a URL like
  `https://<host>/api/feed/<token>`; `curl -i` on it returns HTTP 200,
  `Content-Type: text/calendar`, and a body starting `BEGIN:VCALENDAR` and ending
  `END:VCALENDAR` that a standards ICS parser (e.g. node-ical) parses without error,
  containing events from BOTH sources.
- With exclude-keyword `standup`, no VEVENT whose SUMMARY contains "standup" (any case)
  appears in the output; with include-keyword `piano`, ONLY events whose SUMMARY contains
  "piano" appear.
- With busy-only mask on, every VEVENT in the output has `SUMMARY:Busy` and contains no
  DESCRIPTION, LOCATION, ATTENDEE, or ORGANIZER lines; DTSTART/DTEND are preserved.
- The token segment of the feed URL is NOT decodable without the server key:
  base64url-decoding it yields ciphertext bytes, not readable URLs or JSON (verifiable
  with `echo <token> | base64 -d | strings` showing none of the source URLs), and
  tampering with one character of the token makes the endpoint return 400, not data.
- A feed built from 5 source URLs of ~180 chars each produces a total merged-feed URL
  under 2000 characters.
- If one of the source URLs is dead (e.g. returns 404 or times out), the feed endpoint
  still returns 200 with the other sources' events merged, plus a marker event noting the
  failed source count.
- `GET /api/feed/<token>` response carries a `Cache-Control` header with `s-maxage` of at
  least 300.
- The builder page works with no login: a fresh incognito browser can complete flow 1 and
  see the flow 3 preview.

## Out of scope

- Accounts, persistence, or any database (the URL is the only state).
- Editing an existing feed (regenerate a new URL instead).
- Timezone conversion or display-timezone UI (timezones pass through as-is).
- OAuth'd calendar APIs (Google Calendar API, Microsoft Graph) — ICS URLs only.
- Filtering on fields other than SUMMARY; regex filters.
- Rate limiting beyond basic per-request upstream caps; custom branding; custom refresh
  intervals; dedup of identical events across sources.

## Notes for builder

- P0 (from problem analysis): the config blob MUST be encrypted (AES-256-GCM, key from
  `ENCRYPTION_KEY` env var, random IV per token, auth tag verified on decrypt) — plain
  base64/deflate would let a busy-only URL recipient recover the secret source URLs and
  bypass the privacy mask. Fail fast with a clear error if `ENCRYPTION_KEY` is unset.
- Compress (deflate/gzip) the JSON config BEFORE encrypting to keep the URL short.
- Upstream fetches: ~8 s timeout, ~1 MB size cap per source, send a User-Agent like
  `ical-blend/1.0 (+https://<host>)`. Accept and normalize `webcal://` to `https://`.
- Set `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` on the feed route
  so calendar clients and Vercel's edge don't hammer source feeds.
- ICS line handling: respect folded lines (CRLF + space) when filtering/stripping; emit
  CRLF line endings and fold lines >75 octets per RFC 5545.

Production URL: TBD
