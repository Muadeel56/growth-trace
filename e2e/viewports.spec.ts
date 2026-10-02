import { expect, test } from '@playwright/test';

/**
 * Placeholder responsive check. It asserts the viewport the project configured, which is
 * enough to prove all three projects run. Replace with real page assertions once the
 * frontend exists.
 */
test('runs at the project viewport', ({ viewport }) => {
  expect(viewport).not.toBeNull();
  expect(viewport!.width).toBeGreaterThan(0);
});
