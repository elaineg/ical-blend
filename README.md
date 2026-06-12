# iCal Blend

Merge 2–5 ICS calendar feed URLs into one subscribable feed, with optional
case-insensitive keyword filters (on SUMMARY) and a busy-only privacy mask.
No account, no database — the entire config is deflate-compressed, encrypted
with AES-256-GCM, and carried in the feed URL itself.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `ENCRYPTION_KEY` | yes | 32 bytes as 64 hex chars (or base64). Generate: `openssl rand -hex 32`. The app fails fast with a clear error if unset. Rotating the key invalidates all previously issued feed URLs. |
| `ALLOW_TEST_FIXTURES` | no | Set to `1` to enable `/api/test-fixture/*` in production builds (used by e2e/verification only). |

For local dev, put the key in `.env.local` (gitignored):

```
ENCRYPTION_KEY=<64 hex chars>
```

## API

- `POST /api/token` — body `{ sources: string[2..5], include?, exclude?, busyOnly? }`
  → `{ token, feedPath }`. Validates URLs (http/https/webcal) and filter lengths.
- `GET /api/feed/<token>` — decrypts the token, fetches sources concurrently
  (8 s timeout, 1 MB cap, custom User-Agent), merges/filters/masks, returns
  `text/calendar` with `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
  A failed source yields a marker event, not an error. Tampered tokens → 400.
  Append `?preview=json` for the builder page's JSON preview.

## Develop / test

```
npm run dev       # http://localhost:3000
npm test          # vitest unit tests (ICS, token crypto, validation)
npm run test:e2e  # Playwright e2e against a dev server with mock ICS fixtures
npm run build && npm run lint
```
