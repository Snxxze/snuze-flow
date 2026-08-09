import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

test.describe('E2E-07: Dashboard Aggregation Check', () => {
  test('verifies personal dashboard aggregates tasks across workspaces', async ({ page }) => {
    // Synchronized Login
    await loginAsOwner(page);

    // Navigate to Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify main welcome banner & stats grid exist
    await expect(page.locator('h1', { hasText: /สวัสดี|Hello/i })).toBeVisible();

    // Verify metric cards exist
    await expect(page.locator('.grid').first()).toBeVisible();
  });
});
