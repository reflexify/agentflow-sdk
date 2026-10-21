import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  // The unit tests' zone, so a date the seed calls today is today here too.
  use: { baseURL: 'http://localhost:5175', trace: 'retain-on-failure', timezoneId: 'Asia/Ho_Chi_Minh' },
  webServer: { command: 'pnpm dev', url: 'http://localhost:5175/?demo', reuseExistingServer: !process.env.CI, timeout: 60_000 },
  // The screenshots for a design review are their own project (`pnpm e2e:screens`), so a test run neither takes them
  // nor reports them skipped.
  projects: [
    { name: 'chromium', grepInvert: /@screens/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit', grepInvert: /@screens/, use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'screens', grep: /@screens/, use: { ...devices['Desktop Chrome'] } },
  ],
});
