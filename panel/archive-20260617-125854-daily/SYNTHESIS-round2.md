# iCal Blend — Panel Synthesis, Round 2

App: ical-blend · Preview tested: https://ical-blend-3vh6ec06l-elainegao.vercel.app · Run: 20260612-211511-daily

## Score table (all 10 re-tested — no one fully passed round 1, so a full re-test was required)

| # | Persona | Role | Clarity | Value | Advocacy R1→R2 | Prior concerns addressed |
|---|---------|------|---------|-------|----------------|--------------------------|
| 1 | Priya | Sr backend engineer | Yes | Yes | 8 → **9** | Yes — localhost/junk URLs rejected at submit, non-cal sources flagged at create time |
| 2 | Marcus | Frontend engineer | Yes | Yes | 8 → **9** | Yes — single-feed builds explicitly, dedup real (Scotland-only events survive) |
| 3 | Wen | Marketing data analyst | Yes | Yes | 8 → **6** | Partial — both R1 blockers fixed, but objects to dedup as undisclosed lossy transform |
| 4 | Tomás | Operations analyst | Yes | Yes | 8 → **9** | Yes — busy-mask UID now opaque hash, 0 "gov.uk" leakage |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 7 → **9** | Yes — "Copied!" confirms, duplicates deduped |
| 6 | Jules | Content/community marketer | Yes | Yes | 8 → **9** | Yes — dedup verified (177→114, zero exact dups), filters + no-login intact |
| 7 | Aisha | Product designer | Yes | Yes | 7 → **9** | Yes — empty-submit message, "Copied!" + green confirm, errors clear on correct |
| 8 | Rob | Brand/visual designer | Yes | Yes | 8 → **9** | Yes — busy-mask UID hashed, hard grep for client identity returns zero |
| 9 | Elena | Engineering manager | Yes | Yes | 8 → **9** | Yes — one-tap Add-to-Google-Calendar deep link works on phone, Copy confirms |
| 10 | Sam | Product manager | Yes | Yes | 8 → **9** | Yes — dedup in preview, "Copied!", Outlook instructions added |

**Exit condition (≥9 testers at advocacy ≥9, clarity=Yes, value=Yes): MET — 9/10 at ≥9, clarity & value unanimous Yes.**

## What the round-2 fixes delivered (verified live by testers + fresh verifier)
- **Copy confirmation (A):** Dana, Aisha, Elena all verified the clipboard write + "Copied!" state. Lifted both R1 7s.
- **Dedup (B):** Jules and Marcus independently curl-verified 177 raw → 114 merged, zero exact duplicates, **region-unique events preserved** — confirming dedup collapses only genuine shared events.
- **Busy-mask UID hashing (C):** Tomás and Rob both grepped the masked feed and confirmed zero source identity (`busy-<hex>@ical-blend` opaque UIDs); this was the single fix each named.
- **Create-time validation + confirmation (D/F):** Priya verified localhost/link-local/junk rejected with HTTP 400 + clear message; merged event count surfaced.
- **Add-to-Google + Outlook (E):** Elena verified the `calendar/render?cid=` deep link works on her phone.

## The one holdout — Wen (8 → 6): assessed, NOT a shipping defect
Wen's two R1 blockers (no create-time bad-source warning; no event-count confirmation) are both
fixed and she verified them. Her score *dropped* because the new dedup keys on DTSTART+SUMMARY
(not UID alone) and collapsed 63 of 177 gov.uk events whose UIDs differ — to her data-hygiene
persona this is an "invisible lossy transform."

Assessment — this is correct, user-requested behavior, not a bug:
- The 63 collapsed entries are genuine shared UK bank holidays (e.g. Christmas Day appears in
  both england-and-wales and scotland feeds with different publisher UIDs but the same date+title).
  Collapsing them is exactly what Jules, Marcus, Dana, and Sam explicitly asked for in round 1.
- Over-aggression is ruled out by direct evidence: Marcus confirmed **Scotland-only events survive**
  the merge — if dedup were dropping distinct events, region-unique holidays would vanish. They don't.
- For timed events, DTSTART carries the time, so same-title events at different times do NOT collapse;
  the date-only collapse only affects all-day events with an identical title, which are duplicates.

Wen's *legitimate* residual point is **disclosure**: the confirmation says "Merged N events" but
doesn't say how many duplicates were removed. That would convert the transform from invisible to
visible and likely satisfy her. It is a cheap enhancement, NOT a correctness fix — logged below
for a future iteration rather than gating this ship (the exit bar is met and the behavior is correct).

## Minor nits raised by passing testers (non-blocking, logged for future)
- Disclose dedup count in the confirmation ("Merged 114 events — 63 duplicates removed across sources"). (Wen; also reassures all data-conscious users.)
- Long (~170-char) feed token URL is ugly in a terminal / unlabeled. (Priya, Jules)
- "Copied!" renders as a sibling label rather than swapping the button's own text. (Marcus)
- Result renders below the still-expanded form with no scroll-to-result. (Aisha)
- A "where to find your calendar's ICS link" hint for non-technical users. (Dana, Sam)
- Mask copy on-screen doesn't state that identifiers are stripped. (Tomás)

## Decision
Exit condition met with all fixes verified live and a fresh-context verifier PASS (build clean,
40/40 unit, gating dedup/mask/merge items confirmed in the deployed build). Promote the verified
preview to production and mark PASSED.
