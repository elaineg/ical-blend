import { defineConfig } from "@playwright/test";

const PORT = 3877;

// Set E2E_BASE_URL (e.g. to a Vercel preview/prod URL) to run the e2e suite
// against a deployed instance instead of a local dev server.
const externalBaseURL = process.env.E2E_BASE_URL?.replace(/\/$/, "");

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}`,
  },
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: `npm run dev -- --port ${PORT}`,
          url: `http://localhost:${PORT}`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            // .env.local also provides ENCRYPTION_KEY in dev; this is a fallback so
            // e2e runs deterministically even without .env.local.
            ENCRYPTION_KEY:
              process.env.ENCRYPTION_KEY ??
              "5cf0d2bb9d2e4f6a8b1c3d5e7f90a1b2c3d4e5f60718293a4b5c6d7e8f901234",
          },
        },
      }),
});
