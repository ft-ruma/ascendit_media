import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3100)
// PW_CHANNEL=chrome uses the installed Chrome instead of the downloaded Chromium.
const channel = process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, ...channel } },
    { name: 'phone', use: { ...devices['Pixel 7'], ...channel } },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    // The suite posts many briefs from one IP; lift the per-IP lead limit for the test server only.
    env: { LEAD_RATE_LIMIT: '1000' },
    timeout: 120_000,
  },
})
