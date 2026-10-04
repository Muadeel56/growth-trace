import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Waits for entrance animations to finish (ambient, infinite ones are ignored). */
export async function settle(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

/** The page must never scroll sideways; wide content scrolls inside its own container. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}
