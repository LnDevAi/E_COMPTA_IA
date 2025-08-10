import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour E-COMPTA-IA
 * Tests End-to-End pour plateforme comptable SYSCOHADA
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4200',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording for failed tests */
    video: 'retain-on-failure',
    
    /* Timeout for each action */
    actionTimeout: 30000,
    
    /* Timeout for navigation */
    navigationTimeout: 30000,
    
    /* Global test timeout */
    timeout: 60000,
    
    /* Accept downloads */
    acceptDownloads: true,
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Locale for tests */
    locale: 'fr-FR',
    
    /* Timezone */
    timezoneId: 'Africa/Ouagadougou',
    
    /* User agent for SYSCOHADA region */
    userAgent: 'E-COMPTA-IA-Test/1.0 (SYSCOHADA; BF; fr)',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'X-Test-Environment': 'e2e'
    }
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication and data seeding
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup'
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/
    },

    // Desktop Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5']
      },
      dependencies: ['setup']
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12']
      },
      dependencies: ['setup']
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge' 
      },
      dependencies: ['setup']
    },
    {
      name: 'Google Chrome',
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome' 
      },
      dependencies: ['setup']
    },

    // Accessibility tests
    {
      name: 'accessibility',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup']
    },

    // Performance tests
    {
      name: 'performance',
      testMatch: /.*\.perf\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome']
      },
      dependencies: ['setup']
    },

    // SYSCOHADA specific tests
    {
      name: 'syscohada',
      testMatch: /.*\.syscohada\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'fr-BF', // Burkina Faso locale
        timezoneId: 'Africa/Ouagadougou'
      },
      dependencies: ['setup']
    }
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/playwright-artifacts',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      NODE_ENV: 'test'
    }
  },

  /* Global setup */
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  
  /* Global teardown */
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  /* Test directory */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**'
  ],

  /* Expect options */
  expect: {
    /* Timeout for expect() assertions */
    timeout: 10000,
    
    /* Custom matchers timeout */
    toHaveScreenshot: { 
      threshold: 0.2,
      mode: 'actual'
    },
    
    /* Visual comparison options */
    toMatchSnapshot: {
      threshold: 0.2
    }
  },

  /* Maximum time one test can run for */
  timeout: 120000, // 2 minutes per test

  /* Maximum time for entire test run */
  globalTimeout: 60 * 60 * 1000, // 1 hour

  /* Preserve output directory */
  preserveOutput: 'failures-only',

  /* Update snapshots */
  updateSnapshots: 'missing',

  /* Test metadata */
  metadata: {
    platform: 'E-COMPTA-IA',
    version: '1.0.0',
    environment: 'test',
    syscohada: 'AUDCIF-2017',
    region: 'OHADA',
    currency: 'XOF'
  }
});