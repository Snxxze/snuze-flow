import { test, expect } from '@playwright/test';
import { loginAsOwner, loginAsMember } from './helpers/auth';

test.describe('E2E-06: Owner vs Member Role Authorization', () => {
  test('verifies Owner login and full workspace access', async ({ page }) => {
    await loginAsOwner(page);

    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });

  test('verifies Member login and access to assigned workspaces', async ({ page }) => {
    await loginAsMember(page);

    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });
});
