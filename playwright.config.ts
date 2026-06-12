import { defineConfig } from "@playwright/test";

const PORT = 3877;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
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
});
