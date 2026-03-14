import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page by default', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.locator('button', { hasText: /Sign In/i })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Create an account');
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.locator('h1')).toContainText(/Join/i);
  });
});
