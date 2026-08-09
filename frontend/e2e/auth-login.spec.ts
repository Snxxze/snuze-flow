import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

test.describe('E2E-01: Login → Workspace Navigation', () => {
  test('logs in successfully and redirects to workspace with persisted session token', async ({ page }) => {
    await loginAsOwner(page);

    // Verify token exists in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});
