import { defineConfig, devices } from '@playwright/test';

// The gallery's port. `vite.config.ts` reads the same variable, so the server and the tests agree; CI sets it so that a gallery a developer
// left running on 5182 cannot be the one the tests find.
const port = Number(process.env.KIT_GALLERY_PORT) || 5182;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  // One retry in CI only. A test that passes on it is reported flaky, which is a test to fix, not a pass to ignore; locally a failure is a failure.
  retries: process.env.CI ? 1 : 0,
  // In CI the `github` reporter annotates the run with each failure and each flaky test, so a pass on the retry is visible on the run's page and not only in its log.
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
  webServer: { command: 'pnpm gallery', url: `http://localhost:${port}/gallery/`, reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Opt-in with KIT_FIREFOX=1, once Firefox is installed (`pnpm exec playwright install firefox`): it runs only the checks that name sticky
    // positioning, which is the one thing the kit relies on that Firefox might draw differently.
    ...(process.env.KIT_FIREFOX === '1' ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /gallery\.spec\.ts/, grep: /sticky/ }] : []),
  ],
});
