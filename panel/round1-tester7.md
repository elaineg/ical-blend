```json
{"tester":7,"name":"Aisha","clarity":"Yes","value":"Yes","advocacy":7}
```

# Aisha — Product designer (round 1)

## 5-second read: CLARITY — Yes
"iCal Blend" + the subhead "Merge 2–5 calendar feed URLs into one subscribable feed — with
optional keyword filters and a busy-only privacy mask. No account, nothing stored" told me
exactly what it is and who it's for. That subhead does a lot of honest work in one sentence —
this is the kind of copy I'd screenshot as a good example. Form-first, no marketing fluff,
no fake hero. I respect the restraint.

## VALUE — Yes
Today I stitch a personal GCal + my partner's shared cal + the kids' school ICS by manually
adding each as a separate calendar and eyeballing overlaps. The busy-only mask is genuinely
the unlock — I'd share a merged feed without leaking event titles. I created a real feed from
the two gov.uk holiday ICS files in under a minute; the preview confirmed it actually merged
and filtered. The "config lives in the URL, nothing stored" model is a clean, considered
choice and I trust it more than yet another account.

## What worked
- Subhead copy and the footer "Lose the URL? Just build a new one." — tone is calm and exact.
- Both Feed URL and webcal:// surfaced, with per-platform Subscribe instructions. Thoughtful.
- The busy-only helper text ("descriptions, locations and attendees are stripped. Times kept")
  is precise — answers the privacy question before I ask it.
- Bad URL caught client-side with a clear red message: "Not a valid URL: not-a-real-url-haha".

## Friction / craft gaps (I judge these hard)
1. EMPTY SUBMIT IS SILENT. Clicked "Create feed" with both fields blank — nothing happened.
   No error, no nudge, no disabled state. A considered form tells me what it wants. This is
   the single most un-crafted moment.
2. COPY BUTTON GIVES NO FEEDBACK. Clicked "Copy" — clipboard DID receive the URL (verified),
   but the button label stayed "Copy". No "Copied!", no checkmark, no color flicker. On a
   200-char opaque URL I have zero confirmation it worked. Cheap fix, big trust payoff.
3. ERROR IS ORPHANED. The red "Not a valid URL" message floats below the button, not under
   the field that caused it. With 2–5 inputs I have to hunt for which row is wrong.
4. BUSY-ONLY PREVIEW IS A WALL OF "Busy". Ten identical "Busy" rows with dates that aren't in
   chronological order (Jun 15, Aug 3, Aug 31, May 3...). It reads broken even though it's
   "working as designed." Sort by date, and maybe keep the real title greyed in preview so I
   can sanity-check the merge before I trust the masked output.
5. NO EMPTY STATE FOR THE PREVIEW/RESULT region before submit — fine, but the form jumps with
   no transition when results appear; a little anchoring/scroll-to-result would feel polished.

## Biggest thing that would raise my advocacy
Give "Create feed" real states: disable until ≥2 valid URLs, validate per-field with the
error under the offending input, and make Copy say "Copied!". Right now the happy path is
lovely but the edges feel unfinished — and edges are exactly where I judge craft. Fix the
silent empty submit + the dead Copy button and this jumps to a 9 I'd post in our design Slack.
