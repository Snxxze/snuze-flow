import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

test.describe('E2E-04: Overdue Deadline Alert Scoped Verification', () => {
  test('creates specific task with past due date and verifies overdue alert badge on that exact card', async ({ page }) => {
    // 1. Synchronized Login
    await loginAsOwner(page);

    // 2. Go to projects list and open first project
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.waitFor({ state: 'visible', timeout: 10000 });
    await firstProjectLink.click();
    await page.waitForURL(/\/projects\/[a-f0-9-]+/);

    // 3. Wait for project detail page load and click Create Task button
    const createTaskBtn = page.locator('button', { hasText: 'สร้างงาน' }).first();
    await createTaskBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createTaskBtn.click();

    // 4. Unique task identifier
    const uniqueTaskTitle = `E2E Overdue Task ${Date.now()}`;

    // Locate Radix Dialog container
    const dialogContainer = page.locator('[role="dialog"]').first();
    await expect(dialogContainer).toBeVisible();

    // Fill title
    const titleInput = dialogContainer.locator('input[type="text"]').first();
    await titleInput.focus();
    await titleInput.fill(uniqueTaskTitle);

    // Fill description
    const descTextarea = dialogContainer.locator('textarea').first();
    await descTextarea.focus();
    await descTextarea.fill('Task created with past due date to verify overdue badge scoping');

    // Select past due date (Day 1 of current month, which is safely in the past)
    const datePickerTrigger = dialogContainer.locator('button', { hasText: /เลือกวันกำหนดส่ง|Pick a date/i }).first();
    await datePickerTrigger.click();

    // Select day 1 in Popover calendar grid
    const dayOneBtn = page.locator('button', { hasText: /^1$/ }).first();
    await dayOneBtn.waitFor({ state: 'visible', timeout: 5000 });
    await dayOneBtn.click();

    // Close Radix Popover modal backdrop cleanly by pressing Escape
    await page.keyboard.press('Escape');

    // Set up API listener for POST /api/projects/:id/tasks (201 Created or 200 OK)
    const createTaskPromise = page.waitForResponse(
      (resp) => resp.url().includes('/tasks') && resp.request().method() === 'POST' && (resp.status() === 201 || resp.status() === 200),
      { timeout: 15000 }
    );

    // Submit task creation
    const submitBtn = dialogContainer.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Wait for task creation API response (201 Created)
    const createTaskResponse = await createTaskPromise;
    expect(createTaskResponse.status()).toBe(201);

    // 5. SCOPED ASSERTION: Locate the EXACT task card created by this test
    const specificTaskCard = page.locator('.group', { hasText: uniqueTaskTitle }).first();
    await expect(specificTaskCard).toBeVisible();

    // 6. Assert user-visible overdue status text WITHIN this specific task card
    const overdueBadgeText = specificTaskCard.locator('text=/เกินกำหนด|Overdue/i').first();
    await expect(overdueBadgeText).toBeVisible();

    // 7. Assert red alert styling class text-status-danger on the badge
    const redBadgeElement = specificTaskCard.locator('.text-status-danger').first();
    await expect(redBadgeElement).toBeVisible();
  });
});
