import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const fixturePort = 3101;
const fixtureApi = `http://localhost:${fixturePort}`;

/**
 * Responsive and accessibility checks against the Next.js app (dev server, so the /design
 * route is available). One project per browser; each spec loops over the viewport matrix
 * in e2e/viewports.ts. `npm run test:responsive` runs Chromium only (verify, pre-commit);
 * CI runs all three in the Playwright Docker image, which also owns the screenshot
 * baselines (see README "Updating screenshot baselines").
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: 'e2e/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: { baseURL: `http://localhost:${port}` },
  webServer: [
    {
      command: 'node e2e/fixtures/server.ts',
      url: `${fixtureApi}/health`,
      reuseExistingServer: !process.env.CI,
      env: { FIXTURE_PORT: String(fixturePort) },
    },
    {
      command: `npm run dev -w @growthtrace/frontend -- --port ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_DIST_DIR: '.next-e2e',
        API_BASE_URL: fixtureApi,
        NEXT_PUBLIC_API_BASE_URL: fixtureApi,
      },
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
