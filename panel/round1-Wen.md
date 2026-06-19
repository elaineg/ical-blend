# Wen — Round 1
- Advocacy: 9/10
- Clarity: Yes
- Value: Yes
- Found-preview-cold: Yes
- Top blocker: none (only a nit: sample populates URLs but doesn't auto-render the merge; I had to click Preview)
- Prior concern addressed: Yes

## Walkthrough
1. Cold load: headline "blend your work, personal, and shared calendars into one link" + "Preview & test them, then get one feed. No account." I knew what this was in <10s.
2. "Load a sample feed" cold: populated two REAL public URLs (UK gov bank holidays + a Chelsea fixtures .ics). It did NOT auto-preview — URLs filled, but I had to click "Preview merged calendar" to see anything. Minor friction; I expected an instant populated merge.
3. Preview with sample: per-source STATUS with ✓ and counts — "[Holidays] 83 events fetched", "[Personal] 325 events fetched". Reconciliation line: "Fetched 408 events → kept 408 after filters & mask". Chronological NEXT 15 list with [source] labels. Clean.
4. BAD URL test (swapped feed 2 to a 404): HONEST. "✗ [Personal] — feed not found (404)", recon dropped to "Fetched 83 → kept 83", plus "1 source failed — its events are not included." AND it injected a visible "iCal Blend: 1 source failed" event into the feed so a subscriber sees the failure in their calendar. Exactly the no-silent-failure behavior I demand.
5. Filter scrutiny (exclude "bank"): "Fetched 408 → kept 375 after filters & mask" + explicit "(33 removed by filters/mask)". 408−33=375 reconciles to the event. Bank-holiday rows visibly disappeared from the list.
6. Mask test: count held at 375 (mask transforms, doesn't drop), titles became "[Holidays] Busy" with source label + times kept. Correct accounting.
7. Create feed: no signup. Got https:// + webcal:// links + Google Calendar button. Honest note: "URLs are never stored persistently, but they do transit the server." I curl'd the live feed endpoint: valid VCALENDAR, exactly 408 VEVENTs — matches the blend-time count byte-for-byte.

## Answers
1. CLARITY: Yes. Headline names the three calendars and the one-link outcome; "No account" and "Preview & test" up top set expectations precisely. No jargon, nothing ambiguous.
2. VALUE: Yes. Today I'd subscribe to a campaign-launch feed, a dbt-run schedule feed, and personal separately and eyeball conflicts — or hack a Sheets/Looker export. This gives one subscribable feed with per-source kept/removed counts I can audit, which my current approach can't show. The reconciliation is what wins me: I can prove no event was silently dropped.
3. ADVOCACY: 9/10. I'd bring this up unprompted to other analysts BECAUSE the count reconciliation and honest 404 status respect data hygiene — the one thing most calendar-merge tools fail. Not a 10 only because the sample loads URLs without auto-rendering the merge (extra click before the payoff), and the feed URL transits the server (disclosed and acceptable, but it's why it's not pure client-side). Prior blockers — pre-create test, visible fetch status, populated demo — all addressed.
