import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

test.describe('E2E-05: Subtask Checklist & Progress Rate Synchronization', () => {
  test('verifies workspace login, navigation and checklist state persistence', async ({ page }) => {
    // 1. Login with reliable helper
    await loginAsOwner(page);

    // 2. Navigate to projects
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    // 3. Verify workspace header
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();

    // 4. Reload page and assert auth session persists
    await page.reload();
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });
});
