import { test, expect } from '@playwright/test';

test('should load the initial project page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Your app is running.');
});
