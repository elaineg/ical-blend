# Round 3 — Sam (PM, mobile-heavy, shares links constantly)

(a) Advocacy: **8/10**
(b) Value clear in <30s: **Yes** — headline "Stop checking three calendars" + subhead "Paste 2–5 calendar links. Get one feed. No account." told me what it is and who it's for before I scrolled. The no-account/encrypted-in-URL note pre-empts my "where's my data" reflex.
(c) Biggest remaining blocker: **Still the single device-local secret URL.** Recall is honestly labelled "Saved on this device only," but I genuinely live phone-AND-laptop; a blend made on mobile won't appear on my laptop, and there's no "re-derive from the same inputs." Fine for a holiday merge, still the thing stopping me from subscribing my whole team to the org-facing link.

## Did it just work? YES.
Filled both holiday feeds, opened each feed's Options, set `[US] ` and `[CA] ` prefixes, tapped Create. Got "Merged 65 events from 2 sources. 2 feeds labelled." in one tap, no hang, no debugging. Preview showed real names with prefixes — "[US] Juneteenth", "[CA] Canada Day", "[US] Independence Day", "[CA] Labour Day". I fetched the actual subscribe link myself: HTTP 200, `text/calendar`, 65 events, `SUMMARY:[US] New Year's Day` etc. That is exactly the proof I need before pasting into Slack — and it makes me look organized: clean per-source tags, one tidy link.

## Round-2 → Round-3 movement (re-checking my exact complaints)
- **Prefix spacing** I worried about earlier — clean: `[US] New Year's Day`, proper space, in both preview and the served ICS.
- **Privacy copy honest** — "fetched server-side on each refresh — never stored persistently." Matches reality.
- **Recall polish** — editable nickname field is prominent, "Copied!" cue fires on the Copy button, and the clipboard genuinely held the feed URL (verified, not just the label). Recent-blends list persisted across reload.
- **Busy-mask default** — confirmed OFF on a truly fresh load; it only re-applied because the app remembers my last session (a feature, not a default-on trap). Honest summary line reflects mask state.

Everything I flagged before is fixed. No console errors anywhere. The ONLY reason this isn't a 9 is unchanged from R2: lose the URL / switch device and the blend is gone, and I won't bet a team subscription on a link I can't recover. Net: same honest 8 — polished, trustworthy, but the no-cross-device-recall ceiling is real for my use case.

```json
{"tester": 1, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Single device-local secret URL is still the only copy of the config; no cross-device recall and no re-derive-from-inputs", "Blend made on phone won't show on my laptop — I switch constantly, so the org-facing link I'd actually subscribe my team to feels risky to depend on"], "priorConcernsAddressed": "all"}
```
