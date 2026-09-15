import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'functional-regression.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 45_000,
  reporter: 'list',
  outputDir: 'test-results/functional',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome',
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
      },
    },
    { name: 'WebKit', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'pnpm preview --host 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174/magic-english-buddy/',
    reuseExistingServer: false,
  },
});
