import { test as setup } from '@playwright/test';
import { E2E_OWNER_CREDENTIALS, E2E_MEMBER_CREDENTIALS, loginUser } from './helpers/auth';

const ownerAuthFile = 'playwright/.auth/owner.json';
const memberAuthFile = 'playwright/.auth/member.json';

setup('authenticate as Owner', async ({ page }) => {
  if (!E2E_OWNER_CREDENTIALS.email || !E2E_OWNER_CREDENTIALS.password) {
    throw new Error('[E2E Configuration Error] E2E_OWNER_EMAIL or E2E_OWNER_PASSWORD environment variable is missing.');
  }
  await loginUser(page, E2E_OWNER_CREDENTIALS.email, E2E_OWNER_CREDENTIALS.password);
  await page.context().storageState({ path: ownerAuthFile });
});

setup('authenticate as Member', async ({ page }) => {
  if (!E2E_MEMBER_CREDENTIALS.email || !E2E_MEMBER_CREDENTIALS.password) {
    throw new Error('[E2E Configuration Error] E2E_MEMBER_EMAIL or E2E_MEMBER_PASSWORD environment variable is missing.');
  }
  await loginUser(page, E2E_MEMBER_CREDENTIALS.email, E2E_MEMBER_CREDENTIALS.password);
  await page.context().storageState({ path: memberAuthFile });
});
