import { expect, test } from '@playwright/test';

import { expectNoOverflow, settle } from './helpers';

// Width-by-width layout and axe checks live in responsive.spec.ts; this covers both
// motion settings, since the /design demos animate when motion is allowed.
for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`/design (reducedMotion: ${reducedMotion})`, () => {
    test.use({ contextOptions: { reducedMotion } });

    test('renders every section without horizontal scroll', async ({ page }) => {
      await page.goto('/design');
      await expect(page.getByRole('heading', { level: 1, name: 'Aurora' })).toBeVisible();
      await settle(page);
      for (const name of [
        'Colour',
        'Typography',
        'Motion',
        'Primitives',
        'GrowthTrace components',
      ]) {
        await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
      }
      await expectNoOverflow(page);
    });
  });
}
