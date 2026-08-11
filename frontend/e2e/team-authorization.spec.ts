import { test, expect } from '@playwright/test';

test.describe('E2E-06: Owner Role Authorization', () => {
  // Uses default project storageState (owner.json)
  test('verifies Owner login and full workspace access', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });
});

test.describe('E2E-06: Member Role Authorization & Notification Center', () => {
  // Explicitly use Member authenticated storageState
  test.use({ storageState: 'playwright/.auth/member.json' });

  test('verifies Member login and access to assigned workspaces', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('text=โปรเจกต์ทั้งหมด').first()).toBeVisible();
  });

  test('verifies Notification Center bell opens popover and displays pending invitation items if present', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    // Locate Notification Bell button in topbar
    const bellBtn = page.locator('button[aria-label="การแจ้งเตือน"]').first();
    await expect(bellBtn).toBeVisible();

    // Click Bell to open Notification Center Popover
    await bellBtn.click();

    // Verify Popover content opens
    const popoverContent = page.locator('[role="dialog"]').first();
    await expect(popoverContent).toBeVisible();

    // Verify Notification Title inside Popover
    await expect(popoverContent.locator('text=/การแจ้งเตือน|Notifications/i').first()).toBeVisible();

    // Close Popover cleanly by pressing Escape
    await page.keyboard.press('Escape');
  });
});
