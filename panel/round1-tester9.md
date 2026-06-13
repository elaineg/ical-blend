```json
{"tester":9,"name":"Elena","clarity":"Yes","value":"Yes","advocacy":8}
```

# Elena — Engineering manager, 30-second patience budget, tested on phone (375px)

**1. CLARITY — Yes.** The h1 "iCal Blend" plus the one-line subhead ("Merge 2–5 calendar
feed URLs into one subscribable feed — with optional keyword filters and a busy-only privacy
mask. No account, nothing stored") told me exactly what it does and that there's no signup,
in well under 5 seconds. The form is right there below — no marketing wall, no "Sign in to
continue." For someone like me who lives in Google Calendar, "merge feeds into one
subscribable feed" is instantly the thing I want.

**2. VALUE — Yes.** Today I cope by manually subscribing to our on-call ICS, the recruiting
feed, and my personal cal as three separate calendars in Google Calendar — three subscribe
flows, three colors I have to keep untangling on my phone. This gives me ONE URL I subscribe
to once. The keyword include/exclude and the busy-only privacy mask are genuinely better than
my status quo: I can strip my team's on-call feed down to "Busy" before anyone borrows the
link. Zero setup, no account — that's the bar, and it cleared it.

## What worked (verified live)
- Pasted both gov.uk feeds, hit **Create feed** → got a merged feed in ~3 seconds, no signup.
- Feed URL actually serves valid ICS (HTTP 200, 18KB, 83 events) and the merge is real: it
  contains England's "World Cup bank holiday" AND Scotland-only "St Andrew's Day" together.
- A live **Preview — upcoming events** list rendered the merged events — I could confirm it
  worked before subscribing, which is reassuring.
- Both a **https://** and a **webcal://** URL are offered, with copy buttons for each.
- Clear **Subscribe** steps for Google Calendar ("Other calendars → + → From URL → paste")
  and Apple Calendar. Yes, I could do this from my phone.
- Copy button works — clipboard genuinely received the feed URL.

## Friction points
- **Copy button gives no confirmation.** I clicked Copy; the clipboard did get the URL, but
  the button label stayed "Copy" — no "Copied!" flash, no checkmark. On my phone that reads
  as "did anything happen?" and I'd tap it 3 times. (Copy verified working in test; the UI
  just doesn't acknowledge it.)
- **No one-tap "Add to Google Calendar".** The Subscribe block is text instructions. On a
  PHONE, "Other calendars → + → From URL" is fiddly — Google's mobile app doesn't even
  expose that easily; it's basically a desktop task. A direct "Add to Google Calendar"
  button (or a deep link) would turn this from "I'll do it later at my laptop" into "done."
- **Duplicate events look like a bug at a glance.** The preview shows "Christmas Day" and
  "Boxing Day" twice (both feeds include them). Makes sense once you think about it, but my
  first read was "is the merge double-counting?" A small "shared across sources" note or
  dedupe would kill the doubt.
- Minor: the long opaque feed URL is a little scary ("is that safe to share?"), though the
  "encrypted config in the URL" note mostly answers it.

## Biggest thing that would raise my advocacy (to a 9–10)
A **one-tap "Add to Google Calendar" button** that works from my phone. The text steps are a
desktop chore; for a phone-first, between-meetings manager that's the difference between
recommending it and forgetting it. Second: a "Copied!" confirmation so I trust the copy.
