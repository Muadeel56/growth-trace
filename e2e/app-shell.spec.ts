import { expect, test } from '@playwright/test';

import { expectNoHorizontalScroll } from './helpers';

test('shows a bottom tab bar below md and a sidebar from md up', async ({ page, viewport }) => {
  await page.goto('/');
  const sidebar = page.locator('nav[data-nav="sidebar"]');
  const bottomBar = page.locator('nav[data-nav="bottom"]');

  if (viewport!.width < 768) {
    await expect(bottomBar).toBeVisible();
    await expect(sidebar).toBeHidden();
  } else {
    await expect(sidebar).toBeVisible();
    await expect(bottomBar).toBeHidden();
  }
  await expectNoHorizontalScroll(page);
});

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
