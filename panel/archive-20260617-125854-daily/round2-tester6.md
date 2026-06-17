```json
{"tester":6,"name":"Jules","clarity":"Yes","value":"Yes","advocacy":9}
```

# Jules (content & community marketer, 50/50 desktop+mobile) — Round 2

**Prior concern (my round-1 blocker): FIXED.** Last round, merging the two overlapping
gov.uk feeds produced doubled events for every shared holiday (e.g. "Christmas Day" twice).
Re-tested cold and verified end to end:
- Raw inputs: England-and-Wales = 83 VEVENTs, Scotland = 94 = **177 raw**.
- Merged served feed = **114 VEVENTs** (HTTP 200, `text/calendar`). That's 63 overlapping
  events collapsed.
- `awk` per-event extraction of DTSTART+SUMMARY: **zero exact duplicates** in the served
  feed. Christmas Day, New Year's Day etc. each appear exactly once per date despite living
  in both feeds. (The 10 Christmas entries are 10 different years, not dupes — confirmed by
  date.) This is precisely my community-calendar use case, and it now works.

**Clarity — Yes.** New h1 "Stop checking three calendars" + subhead "Paste 2–5 calendar
links. Get one feed. No account." I understood it in seconds. The benefit-led headline is
actually punchier than round 1's mechanical one.

**Value — Yes.** Today I subscribe to 3+ community ICS feeds separately with no filtering
and constant double-entries where they overlap. This now merges, keyword-filters, AND
dedupes — no login. Include filter re-verified: "Christmas" filter returned 10 events, all
Christmas, zero leaks, zero dupes (was 20/doubled in round 1). No-auth re-verified: feed
URL returns 200 with 0 redirects, no cookie/email wall.

## Remaining friction (none blocking)
- The feed token is still a ~170-char monster — ugly to paste on mobile, and with several
  feeds I can't tell which is which. A short nickname/label is the one thing I still want.
- Still single keyword per box; I'd love "music OR meetup OR workshop" (comma = OR).
- "Lose the URL? Just build a new one" — still slightly scary but acceptable for no-account.

## What would raise advocacy 9 → 10
A label/nickname on generated feeds (so I can manage several) plus multi-keyword OR. The
dedup fix is what moved me from 8 to 9 — overlap is the default state of community
calendars, and this now handles it correctly, so I'd bring it up unprompted in my
marketing Discord. Not a 10 only because juggling several long unlabeled feed URLs is still
mildly annoying for a power user like me.

```json
{"tester": 6, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["feed URLs are long and unlabeled — hard to manage several", "single keyword per box, no OR filtering"], "priorConcernsAddressed": "all"}
```
