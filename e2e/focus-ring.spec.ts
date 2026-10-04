import { expect, test } from '@playwright/test';

/**
 * The token focus ring must render on every surface. Contrast against each surface is
 * covered by the unit test in packages/design-system (contrast.test.ts); this proves the
 * ring is actually drawn with the accent colour when focus comes from the keyboard.
 */
for (const surface of ['bg', 'surface', 'surface-raised']) {
  test(`focus ring is visible on ${surface}`, async ({ page }) => {
    await page.goto('/design');
    const button = page.getByRole('button', { name: `Focus ring on ${surface}`, exact: true });
    await expect(button).toBeVisible();

    // Keyboard modality first, so :focus-visible applies to the programmatic focus.
    await page.keyboard.press('Tab');
    await button.focus();
    await expect(button).toBeFocused();

    const result = await button.evaluate((el, name) => {
      // Resolve token colours the same way the browser serialises computed styles.
      const resolve = (token: string) => {
        const probe = document.createElement('span');
        probe.style.color = `var(--color-${token})`;
        document.body.append(probe);
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      };
      return {
        ring: resolve('accent-from'),
        wellColour: getComputedStyle(el.closest('[data-surface]')!).backgroundColor,
        surfaceColour: resolve(name),
      };
    }, surface);

    // Buttons transition box-shadow, so wait for the ring to finish drawing.
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).boxShadow))
      .toContain(`${result.ring} 0px 0px 0px 4px`);
    expect(result.wellColour).toBe(result.surfaceColour);
  });
}
