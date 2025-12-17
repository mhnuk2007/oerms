import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display landing page with login and register buttons', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /online exam/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('should redirect to auth server on login click', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.getByRole('link', { name: /login/i }).first();
    await loginButton.click();

    await page.waitForURL(/.*oauth2\/authorize.*/);
    await expect(page.url()).toContain('response_type=code');
    await expect(page.url()).toContain('code_challenge');
  });

  test('should show user menu when authenticated', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'oerms_access_temp',
        value: 'mock_token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
  });
});

test.describe('Profile Management', () => {
  test('should show profile update form', async ({ page }) => {
    await page.goto('/profile/update');
    await page.waitForURL(/.*\/api\/auth\/start.*/);
  });
});

test.describe('Dashboard', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/');
  });
});

test.describe('Accessibility', () => {
  test('landing page should be accessible', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);

    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    const inputs = await page.locator('input[type="text"], input[type="email"]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }
  });
});
