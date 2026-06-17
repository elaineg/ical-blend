# iCal Blend — Panel Synthesis, Round 1

App: ical-blend · URL: https://ical-blend.vercel.app · Run: 20260612-211511-daily

## Score table

| # | Persona | Role | Clarity | Value | Advocacy |
|---|---------|------|---------|-------|----------|
| 1 | Priya | Sr backend engineer | Yes | Yes | 8 |
| 2 | Marcus | Frontend engineer | Yes | Yes | 8 |
| 3 | Wen | Marketing data analyst | Yes | Yes | 8 |
| 4 | Tomás | Operations analyst | Yes | Yes | 8 |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 7 |
| 6 | Jules | Content/community marketer | Yes | Yes | 8 |
| 7 | Aisha | Product designer | Yes | Yes | 7 |
| 8 | Rob | Brand/visual designer | Yes | Yes | 8 |
| 9 | Elena | Engineering manager | Yes | Yes | 8 |
| 10 | Sam | Product manager | Yes | Yes | 8 |

**Exit condition (≥9 testers at advocacy ≥9, clarity=Yes, value=Yes): NOT MET.**
Clarity & value are unanimous Yes — the product is legible and wanted. Every shortfall is
on advocacy (all 7–8). No one is below 7; this is a polish-gap, not a product-fit gap. The
core engine is sound: testers independently curl-verified faithful merge (177 VEVENTs, zero
dropped), working include/exclude keyword filters, a genuine server-side busy-only mask, a
valid cacheable ICS response, and a confirmed no-login/no-storage stateless design.

## Complaints grouped by cause (every advocacy <9 driver)

### A. Copy button gives NO feedback — RECURRING (4 testers: Dana 7, Aisha 7, Elena 8, Sam 8)
The "Copy" button copies to clipboard but shows no "Copied!" state. Two of the three lowest
scorers (both 7s) named this. Highest-leverage single fix — touches both holdouts.

### B. No deduplication of identical events across overlapping feeds — RECURRING (4 testers: Marcus 8, Dana 7, Jules 8, Sam 8)
When two source feeds contain the same event, the merged feed shows it twice (and twice as
"Busy" under the mask). Jules's community-calendar use case is *defined* by overlapping
feeds; Sam saw "duplicate events in the preview." A merge tool that doesn't dedupe undercuts
its own core promise. Dedupe by UID (and by DTSTART+SUMMARY fallback when UIDs differ).

### C. Busy-only mask leaks identity via passthrough UID — RECURRING (2 testers: Tomás 8, Rob 8)
Both privacy-mask personas independently caught it: the mask strips SUMMARY/DESCRIPTION/
LOCATION/ATTENDEE/ORGANIZER but passes the original `UID` verbatim (e.g.
`...ChristmasDay@gov.uk`), which leaks the very event identity the mask exists to hide.
Both said this is the *one* fix between 8 and 9–10. Under busy-only, replace UID with an
opaque deterministic hash.

### D. No create-time validation / confirmation — silent on bad or empty input (3 testers: Aisha 7, Wen 8, Priya 8)
- Aisha: empty submit is silently ignored (no message); an "orphaned error message" lingers.
- Wen: a bad/unreachable source URL still builds a feed with no create-time warning, and there's
  no merged-event-count confirmation so she can't trust the merge happened.
- Priya: accepts localhost/link-local/`.local` URLs and non-calendar sources without rejection
  (also a mild SSRF smell to a security-minded engineer).
Fix: validate URLs on submit (reject empty, malformed, link-local/localhost), block obviously
non-http(s) sources, and show a post-create confirmation with the merged event count + any
per-source failures surfaced at build time (not only inside the feed).

### E. No one-tap "Add to Google Calendar" + missing Outlook instructions (2 testers: Elena 8, Sam 8)
Elena (mobile, 30s budget) wants a one-tap add button instead of copy-paste subscribe steps.
Sam wants Outlook/Office365 instructions alongside Google/Apple. Convenience, mobile-weighted.

### F. Single-feed silent no-op (1 tester: Marcus 8)
Creating a feed from a single source "silently no-ops." Likely the same root as D (validation/
confirmation). Lower priority but folds into the D fix.

## Fix plan for round 2 (each maps to a complaint above)
1. **A** — Copy button shows "Copied!" confirmation (revert after ~2s); apply to all copy
   buttons (feed URL, webcal URL). *(Dana, Aisha, Elena, Sam)*
2. **B** — Deduplicate VEVENTs in the merge: by UID, with a DTSTART+SUMMARY fallback. Applies
   before and after the busy-only mask. *(Marcus, Dana, Jules, Sam)*
3. **C** — Under busy-only mask, replace each event's UID with an opaque deterministic hash so
   no source identity leaks. *(Tomás, Rob)*
4. **D/F** — Create-time validation + confirmation: reject empty/malformed/link-local/localhost/
   non-http(s) URLs with an inline message; clear stale errors; show merged event count and any
   per-source fetch failures at create time; allow a single-feed build but confirm it explicitly.
   *(Aisha, Wen, Priya, Marcus)*
5. **E** — Add a one-tap "Add to Google Calendar" link (render-time, using the webcal/https feed
   URL) and add Outlook/Office365 to the subscribe instructions. *(Elena, Sam)*

These are all targeted, non-structural changes. Expected to lift the four 8s closest to the
edge (Marcus, Jules, Tomás, Rob — each named a single blocking fix that's in this list) plus
both 7s (Dana, Aisha) and Elena/Sam/Priya/Wen over the line. No refactor required.
