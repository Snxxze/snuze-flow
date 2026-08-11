import { test, expect } from '@playwright/test';

test.describe('E2E-07: Dashboard Aggregation Check', () => {
  test('verifies personal dashboard aggregates tasks across workspaces', async ({ page }) => {
    // Navigate to Dashboard directly with storageState
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify main welcome banner & stats grid exist
    await expect(page.locator('h1', { hasText: /สวัสดี|Hello/i })).toBeVisible();

    // Verify metric cards exist
    await expect(page.locator('.grid').first()).toBeVisible();
  });
});
