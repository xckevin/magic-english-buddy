import { defineConfig, devices } from '@playwright/test';

// Isolated production-build regression: tests also exercise the installed offline cache.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'ux-mobile.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 45_000,
  reporter: 'list',
  outputDir: 'test-results/ux',
  use: {
    ...devices['Pixel 5'],
    channel: 'chrome',
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/magic-english-buddy/',
    reuseExistingServer: false,
  },
});
