import { Page, expect } from '@playwright/test';

/**
 * Reusable, deterministic login helper for E2E tests.
 * Guarantees API response verification, localStorage token persistence, and UI synchronization.
 */
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');

  // Set up network response listener BEFORE form submission
  const loginResponsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/auth/login') && resp.status() === 200
  );

  // Fill credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // 1. Wait for actual login API response (HTTP 200 OK)
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);

  // 2. Assert token is persisted in localStorage
  await expect.poll(async () => {
    return await page.evaluate(() => localStorage.getItem('token'));
  }, { message: 'localStorage token should be set post-login', timeout: 5000 }).toBeTruthy();

  // 3. Wait for client-side navigation / workspace container render
  await page.waitForURL(/\/projects|\/dashboard/);
  await expect(page.locator('text=SnuzeFlow').first()).toBeVisible();
}

export async function loginAsOwner(page: Page): Promise<void> {
  await loginUser(page, 'demo@snuzeflow.com', 'password123');
}

export async function loginAsMember(page: Page): Promise<void> {
  await loginUser(page, 'alex@snuzeflow.com', 'password123');
}
