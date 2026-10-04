import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { expectNoHorizontalScroll, settle } from './helpers';

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`/design (reducedMotion: ${reducedMotion})`, () => {
    test.use({ contextOptions: { reducedMotion } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/design');
      await expect(page.getByRole('heading', { level: 1, name: 'Aurora' })).toBeVisible();
      await settle(page);
    });

    test('renders every section without horizontal scroll', async ({ page }) => {
      for (const name of [
        'Colour',
        'Typography',
        'Motion',
        'Primitives',
        'GrowthTrace components',
      ]) {
        await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
      }
      await expectNoHorizontalScroll(page);
    });

    test('has no serious or critical axe violations', async ({ page }) => {
      const { violations } = await new AxeBuilder({ page }).analyze();
      const blocking = violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id} (${v.nodes.length}): ${v.help} -> ${v.nodes[0]?.target.join(' ')}`);
      expect(blocking).toEqual([]);
    });
  });
}
