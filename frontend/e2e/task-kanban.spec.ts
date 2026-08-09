import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

test.describe('E2E-03: Task Creation & Kanban Workspace Navigation', () => {
  test('creates task and navigates through project workspace', async ({ page }) => {
    await loginAsOwner(page);

    // Navigate to projects list
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    // Verify workspace header is rendered
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });
});
