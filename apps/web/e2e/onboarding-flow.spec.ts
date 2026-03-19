import { test, expect } from '@playwright/test';

// Fresh user — no shared auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Onboarding flow: new account → complete all steps → dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  const uniqueId = Date.now();
  const email = `onboard-${uniqueId}@openvitals.dev`;
  const password = 'TestPassword123!';
  const authFile = `e2e/.auth/onboarding-user-${uniqueId}.json`;

  test('1. register redirects to onboarding, not timeline', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

    await page.getByLabel('Name').fill('Onboarding Tester');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    // Wait for button to be ready, then submit
    const createBtn = page.getByRole('button', { name: 'Create account' });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // Should show "Creating account..." then redirect
    await page.waitForURL('**/onboarding', { timeout: 15000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-1-redirect.png', fullPage: true });

    await page.context().storageState({ path: authFile });
  });

  test('2. dashboard routes redirect to onboarding before completion', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/timeline');
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    await page.goto('/labs');
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    await page.goto('/settings');
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/onboard-2-redirect.png', fullPage: true });
    await context.close();
  });

  test('3. step 0: Welcome → step 1: About You', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/onboarding');
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-3-welcome.png', fullPage: true });

    await page.getByRole('button', { name: /get started/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('About you')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-3-about-you.png', fullPage: true });

    await page.context().storageState({ path: authFile });
    await context.close();
  });

  test('4. step 1: fill About You → step 2: Goals', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/onboarding');
    await page.waitForTimeout(2000);
    await expect(page.getByText('About you')).toBeVisible({ timeout: 10000 });

    // Fill required fields
    await page.locator('input[placeholder="First"]').fill('Onboarding');
    await page.locator('input[placeholder="Last"]').fill('Tester');
    await page.locator('input[type="date"]').fill('1990-05-15');
    await page.getByRole('button', { name: 'Male', exact: true }).click();
    await page.screenshot({ path: 'e2e/screenshots/onboard-4-about-filled.png', fullPage: true });

    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Step 2 of 7')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-4-goals.png', fullPage: true });

    await page.context().storageState({ path: authFile });
    await context.close();
  });

  test('5. reload preserves step position', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/onboarding');
    await page.waitForTimeout(2000);

    // Should resume on step 2 (Goals)
    await expect(page.getByText('Step 2 of 7')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-5-resume.png', fullPage: true });

    await context.close();
  });

  test('6. complete all remaining steps', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/onboarding');
    await page.waitForTimeout(2000);

    // Step 2: Goals — select one reason, then continue
    await expect(page.getByText('Step 2 of 7')).toBeVisible({ timeout: 10000 });
    await page.getByText('Understand my lab results').click();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(500);

    // Steps 3–7: Skip through each
    for (let i = 3; i <= 7; i++) {
      await expect(page.getByText(`Step ${i} of 7`)).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /skip for now/i }).click();
      await page.waitForTimeout(500);
    }

    // Complete step
    await expect(page.getByText("You're all set")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-6-complete.png', fullPage: true });

    await page.context().storageState({ path: authFile });
    await context.close();
  });

  test('7. "Go to your dashboard" navigates to home', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/onboarding');
    await page.waitForTimeout(2000);

    await expect(page.getByText("You're all set")).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Go to your dashboard' }).click();

    await page.waitForURL('**/home', { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-7-dashboard.png', fullPage: true });

    await page.context().storageState({ path: authFile });
    await context.close();
  });

  test('8. after completion, /onboarding redirects to /home', async ({ browser }) => {
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();

    await page.goto('/onboarding');
    await page.waitForURL('**/home', { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/onboard-8-no-reenter.png', fullPage: true });

    // Dashboard routes work normally now
    await page.goto('/labs');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/labs');

    await context.close();
  });
});
