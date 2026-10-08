import { expect, test } from '@playwright/test';

import { expectNoOverflow } from './helpers';
import { MD, viewports } from './viewports';

for (const vp of viewports) {
  test.describe(`app shell @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('shows a bottom tab bar below md and a sidebar from md up', async ({
      page,
      browserName,
    }) => {
      test.skip(!!vp.chromiumOnly && browserName !== 'chromium', 'Chromium-only width');
      await page.goto('/');
      const sidebar = page.locator('nav[data-nav="sidebar"]');
      const bottomBar = page.locator('nav[data-nav="bottom"]');

      if (vp.width < MD) {
        await expect(bottomBar).toBeVisible();
        await expect(sidebar).toBeHidden();
      } else {
        await expect(sidebar).toBeVisible();
        await expect(bottomBar).toBeHidden();
      }
      await expectNoOverflow(page);
    });
  });
}

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
