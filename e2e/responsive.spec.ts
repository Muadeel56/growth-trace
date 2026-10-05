import { expect, test } from '@playwright/test';

import {
  expectAccessible,
  expectChartsFit,
  expectNoClippedText,
  expectNoOverflow,
  expectNoStickOut,
  expectTapTargets,
  mockApi,
  prepare,
} from './helpers';
import { MD, routes, routeSlug, viewports } from './viewports';

/**
 * Every route at every width: no sideways scroll, nothing sticking out or clipped, touch-
 * sized targets on mobile, charts that fit, tables that become cards, no axe violations,
 * and (in the Playwright Docker image only, PW_VISUAL=1) a screenshot match.
 */
const visual = process.env.PW_VISUAL === '1';
/** Axe at every width in CI; locally only on the layout-representative rows (see Viewport.axe). */
const axeEverywhere = !!process.env.CI || visual;

for (const route of routes) {
  for (const vp of viewports) {
    test.describe(`${route} @ ${vp.name}`, () => {
      test.use({
        viewport: { width: vp.width, height: vp.height },
        contextOptions: { reducedMotion: 'reduce' },
      });

      test('is responsive and accessible', async ({ page, browserName }) => {
        test.skip(!!vp.chromiumOnly && browserName !== 'chromium', 'Chromium-only width');

        const blocked = await mockApi(page);
        await page.goto(route);
        await expect(page.locator('h1')).toBeVisible();
        await prepare(page);

        // The heatmap starts scrolled to the latest week (after hydration).
        await expect
          .poll(() =>
            page.evaluate(() =>
              [...document.querySelectorAll('[data-chart] .overflow-x-auto')].every(
                (el) => el.scrollWidth <= el.clientWidth || el.scrollLeft > 0,
              ),
            ),
          )
          .toBe(true);

        await test.step('no horizontal overflow', () => expectNoOverflow(page));
        await test.step('nothing sticks out', () => expectNoStickOut(page));
        await test.step('no clipped text', () => expectNoClippedText(page));
        if (vp.mobile) await test.step('tap targets', () => expectTapTargets(page));
        await test.step('charts fit', () => expectChartsFit(page));

        await test.step('tables become cards below md', async () => {
          const tables = page.locator('[data-table-mode="table"]');
          const cards = page.locator('[data-table-mode="cards"]');
          for (let i = 0; i < (await tables.count()); i++) {
            if (vp.width < MD) {
              await expect(tables.nth(i)).toBeHidden();
              await expect(cards.nth(i)).toBeVisible();
            } else {
              await expect(tables.nth(i)).toBeVisible();
              await expect(cards.nth(i)).toBeHidden();
            }
          }
        });

        if (vp.axe || axeEverywhere) await test.step('axe', () => expectAccessible(page));

        if (visual) {
          await test.step('screenshot', () =>
            expect(page).toHaveScreenshot(`${routeSlug(route)}-${vp.name}.png`, {
              fullPage: true,
              animations: 'disabled',
              // Full-page captures of blurred layers at 4K are slow to stabilise.
              timeout: 30_000,
              // Time-based text ("2 min ago") would change between runs.
              mask: [page.locator('[role="status"]')],
            }));
        }

        expect(blocked, 'requests reached the real backend').toEqual([]);
      });
    });
  }
}
