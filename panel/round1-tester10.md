```json
{"tester":10,"name":"Sam","clarity":"Yes","value":"Yes","advocacy":8}
```

# Sam (PM, mobile-heavy) — Round 1

Tested on 375px mobile viewport, then curl-verified the generated feed.

## What worked (and it actually worked)
- **5-second clarity: yes.** Headline "Merge 2–5 calendar feed URLs into one subscribable feed" plus the privacy line nailed it. I immediately thought "this is exactly the thing I keep wishing for — my Asana milestone feed + a release calendar + personal into one link."
- Pasted both gov.uk ICS feeds, hit **Create feed**, got a result in ~2s. No account, no friction. This is my favorite kind of tool.
- **Copy button works** — clipboard got the real URL (verified, label is just "Copy", no "Copied!" confirmation but the action fired). Both a plain feed URL and a `webcal://` link with their own copy buttons.
- **Subscribe instructions are concrete**: Google ("Other calendars → + → From URL") and Apple steps spelled out. A teammate could follow these.
- **Live preview of merged events** ("2 sources", upcoming events listed) — this is the trust-builder. I can SEE it merged before I share. Love it.
- I curled the generated feed: returns valid `text/calendar`, 177 events from both sources merged. It genuinely just works — a non-technical teammate pasting this into Google Calendar would get a real subscription.

## Friction / confusion
1. **Duplicate events in preview** — "Christmas Day" twice, "Boxing Day" twice, "New Year's Day" twice (because England+Scotland overlap). Correct behavior, but a non-technical teammate would screenshot that and ask "is it double-booking me?" A de-dupe option or a note would prevent a "looks broken" moment.
2. **No "Copied!" feedback** — clicked Copy, label stayed "Copy". On mobile I wasn't sure it worked. Tiny thing, but I won't debug — I want a flash of confirmation.
3. **Outlook not mentioned** — half my teammates live in Outlook. Subscribe block only covers Google + Apple.
4. **The hard part is upstream of this app**: it assumes I already have the ICS URLs. Finding Asana's "calendar feed" URL or a release-calendar ICS is the actual work; this tool doesn't help me get there. Not a bug, but it's why it's a power-user tool, not mass-market.

## Biggest thing that would raise advocacy
A "Copied!" confirmation + optional de-dupe (or at least a note that overlapping events from multiple feeds are kept). The dupes are the one thing that would make a teammate distrust the link I shared — and looking organized is the whole reason I'd use this.

Advocacy 8: I'd bring this up to other PMs unprompted next time someone complains about juggling calendars. Not a 9 because the duplicate-events preview and no-Outlook gap are exactly the rough edges that make a shared link look slightly unpolished, which is my whole use case.
