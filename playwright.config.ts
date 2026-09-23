import path from 'node:path';
import * as dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const authState = path.resolve(__dirname, 'playwright/.auth/user.json');
const hasClerkCredentials = Boolean(
  process.env.E2E_CLERK_USER_IDENTIFIER && process.env.E2E_CLERK_USER_PASSWORD,
);

const browserProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
];

const authenticatedProjects = hasClerkCredentials
  ? [
      {
        name: 'clerk-auth-setup',
        testMatch: /auth\.setup\.ts/,
        use: { ...devices['Desktop Chrome'], baseURL },
      },
      ...browserProjects.map((project) => ({
        ...project,
        name: `${project.name}-authenticated`,
        dependencies: ['clerk-auth-setup'],
        use: { ...project.use, baseURL, storageState: authState },
      })),
    ]
  : [];

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './apps/frontend/tests',
  globalSetup: './apps/frontend/tests/global.setup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [...browserProjects, ...authenticatedProjects],

  /* Run your local dev server before starting the tests */
  webServer: {
    cwd: __dirname,
    command: 'npx next start -p 3000',
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
