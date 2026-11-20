import { defineConfig, devices } from '@playwright/test';

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * Playwright Configuration for Stitch Visual Design Audit
 * Runs webServer against Vite+ (vp dev) and compares against frozen golden screenshots
 */
export default defineConfig({
  testDir: './tests/e2e',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05, // Calibrated tolerance for OS font rendering differences
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5199',
    trace: 'on-first-retry',
    launchOptions: {
      args: ['--single-process', '--no-sandbox', '--disable-gpu'],
    },
  },
  projects: [
    {
      name: 'design-audit-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: './node_modules/.bin/vp dev --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
