import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

test.describe('E2E-02: Create Project → Workspace Navigation', () => {
  test('creates new project, verifies persistence in list, navigates to workspace detail page, and checks header title', async ({ page }) => {
    // 1. Synchronized Login
    await loginAsOwner(page);

    // 2. Go to project list page
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    // 3. Locate Create Project Button in Hero Banner and click to open dialog
    const createHeroBtn = page.locator('button', { hasText: '+ โปรเจกต์เปล่า' }).first();
    await createHeroBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createHeroBtn.click();

    // 4. Locate Radix Dialog overlay ([role="dialog"])
    const dialogContainer = page.locator('[role="dialog"]').first();
    await expect(dialogContainer).toBeVisible();

    // 5. Fill form with unique project name
    const uniqueProjectName = `E2E Nav Project ${Date.now()}`;
    const projectDesc = 'Automated E2E workspace navigation verification';

    const nameInput = dialogContainer.locator('input[required]').first();
    const descTextarea = dialogContainer.locator('textarea').first();

    await nameInput.focus();
    await nameInput.fill(uniqueProjectName);
    await expect(nameInput).toHaveValue(uniqueProjectName);

    await descTextarea.focus();
    await descTextarea.fill(projectDesc);
    await expect(descTextarea).toHaveValue(projectDesc);

    // 6. Set up API listener (201 Created or 200 OK) and click submit
    const createProjectPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/projects') && resp.request().method() === 'POST' && (resp.status() === 201 || resp.status() === 200),
      { timeout: 15000 }
    );

    const submitBtn = dialogContainer.locator('button[type="submit"]').first();
    await submitBtn.click();

    // 7. Verify backend persistence (API 201 Created)
    const createResponse = await createProjectPromise;
    expect(createResponse.status()).toBe(201);

    // 8. Verify project appears in the project list UI
    const projectCard = page.locator('.group', { hasText: uniqueProjectName }).first();
    await expect(projectCard).toBeVisible();

    // 9. Click into created project detail page
    await projectCard.click();

    // 10. Verify navigation to detail workspace URL (/projects/:id)
    await page.waitForURL(/\/projects\/[a-f0-9-]+/);

    // 11. Verify created project name is displayed in the workspace detail header
    await expect(page.locator('h1', { hasText: uniqueProjectName }).first()).toBeVisible();
  });
});
