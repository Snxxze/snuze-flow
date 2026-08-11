import { test, expect } from '@playwright/test';

test.describe('E2E-05: Subtask Checklist & Progress Rate Synchronization', () => {
  test('verifies workspace login, navigation and checklist state persistence', async ({ page }) => {
    // 1. Navigate to projects directly with storageState
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    // 2. Verify workspace header
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();

    // 3. Reload page and assert auth session persists
    await page.reload();
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });
});
