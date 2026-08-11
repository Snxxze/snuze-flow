import { type Page, expect } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

export const E2E_OWNER_CREDENTIALS = {
  email: process.env.E2E_OWNER_EMAIL,
  password: process.env.E2E_OWNER_PASSWORD,
};

export const E2E_MEMBER_CREDENTIALS = {
  email: process.env.E2E_MEMBER_EMAIL,
  password: process.env.E2E_MEMBER_PASSWORD,
};

/**
 * Perform UI login and verify successful navigation to the authenticated workspace shell.
 * Uses semantic user-facing locators (getByLabel, getByRole).
 */
export async function loginUser(page: Page, email?: string, password?: string): Promise<void> {
  if (!email || !password) {
    throw new Error('[E2E Configuration Error] Missing authentication credentials. Ensure E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD, E2E_MEMBER_EMAIL, E2E_MEMBER_PASSWORD environment variables are set.');
  }

  await page.goto('/login');

  const loginResponsePromise = page.waitForResponse((response) => {
    return (
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/auth/login'
    );
  });

  await page.getByLabel(/อีเมล|email/i).fill(email);
  await page.getByLabel(/รหัสผ่าน|password/i).fill(password);
  await page.getByRole('button', { name: /เข้าสู่ระบบ|login|sign in/i }).click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.ok(), 'Login API request should succeed').toBeTruthy();

  await expect(page).toHaveURL(/\/projects|\/dashboard/);
  await expect(page.getByRole('main')).toBeVisible();
}

export async function loginAsOwner(page: Page): Promise<void> {
  await loginUser(page, E2E_OWNER_CREDENTIALS.email, E2E_OWNER_CREDENTIALS.password);
}

export async function loginAsMember(page: Page): Promise<void> {
  await loginUser(page, E2E_MEMBER_CREDENTIALS.email, E2E_MEMBER_CREDENTIALS.password);
}
