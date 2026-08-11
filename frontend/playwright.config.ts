import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

declare const process: { env: Record<string, string | undefined> };

// Load environment variables from .env file
dotenv.config({ path: '.env' });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    // 1. Authentication setup project (creates owner.json & member.json)
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 2. Main E2E project relying on pre-authenticated storageState
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/owner.json',
      },
      dependencies: ['setup'],
      testIgnore: [/.*\.setup\.ts/],
    },
  ],
});
