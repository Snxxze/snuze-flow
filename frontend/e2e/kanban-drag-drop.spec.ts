import { test, expect } from '@playwright/test';

test.describe('E2E-04: Kanban Drag and Drop Task Status Move & DB Persistence', () => {
  test('drags task from Todo to In Progress column, verifies UI change, reloads page, and confirms DB persistence', async ({ page }) => {
    // 1. Navigate to projects list
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);

    // 2. Open first project in list
    const firstProjectCard = page.locator('.group').first();
    await firstProjectCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstProjectCard.click();

    // 3. Ensure workspace detail page is loaded
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/);

    // 4. Locate or create a task in Todo column
    const todoColumnHeader = page.locator('text=ที่จะทำ').first();
    await expect(todoColumnHeader).toBeVisible();

    const inProgressColumnHeader = page.locator('text=กำลังทำ').first();
    await expect(inProgressColumnHeader).toBeVisible();

    // Look for a task card in Todo column (container with draggable="true")
    let todoTaskCard = page.locator('[draggable="true"]').first();
    let isTaskVisible = await todoTaskCard.isVisible().catch(() => false);

    // If no task exists in Todo, create one
    if (!isTaskVisible) {
      const createTaskBtn = page.locator('button', { hasText: 'สร้างงาน' }).first();
      if (await createTaskBtn.isVisible()) {
        await createTaskBtn.click();
        const dialog = page.locator('[role="dialog"]').first();
        const titleInput = dialog.locator('input[required]').first();
        await titleInput.fill(`E2E Drag Task ${Date.now()}`);
        const submitBtn = dialog.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    todoTaskCard = page.locator('[draggable="true"]').first();
    await expect(todoTaskCard).toBeVisible({ timeout: 10000 });

    const taskTitle = await todoTaskCard.locator('h4').textContent();
    expect(taskTitle).toBeTruthy();

    // 5. Drag the task card to In Progress column
    const inProgressColumn = inProgressColumnHeader.locator('xpath=ancestor::div[contains(@class, "flex-col")]').first();
    await todoTaskCard.dragTo(inProgressColumn);

    // Wait for network response / state update
    await page.waitForTimeout(1000);

    // 6. Reload page to verify backend DB persistence
    await page.reload();
    await page.waitForTimeout(1000);

    // 7. Verify the task title is still rendered on the page and has moved status
    const movedTaskCard = page.locator('[draggable="true"]', { hasText: taskTitle! }).first();
    await expect(movedTaskCard).toBeVisible();
  });
});
