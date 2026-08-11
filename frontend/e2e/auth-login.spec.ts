import { test, expect } from '@playwright/test';
import { loginAsOwner } from './helpers/auth';

// Explicitly use clean unauthenticated context for real UI login testing
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('E2E-01: Login → Workspace Navigation (Real UI)', () => {
  test('logs in successfully through Login form and redirects to authenticated workspace', async ({ page }) => {
    await loginAsOwner(page);

    await expect(page).toHaveURL(/\/(projects|dashboard)/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
