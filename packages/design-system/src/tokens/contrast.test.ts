import { describe, expect, it } from 'vitest';

import { contrast } from './contrast';
import type { ColorToken } from './tokens';

/** Every text/background pair the components render, as [text, background]. */
const pairs: [ColorToken, ColorToken][] = [
  // Body copy on every surface.
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surface-raised'],
  ['text-muted', 'bg'],
  ['text-muted', 'surface'],
  ['text-muted', 'surface-raised'],
  // Button labels on their fills (the primary fill is a gradient: check both stops).
  ['on-accent', 'accent-from'],
  ['on-accent', 'accent-to'],
  ['on-danger', 'danger'],
  ['text', 'surface-raised'],
  // Badge text on badge fills.
  ['text', 'surface-raised'],
  ['success', 'success-subtle'],
  ['warning', 'warning-subtle'],
  ['danger', 'danger-subtle'],
  ['accent-from', 'accent-subtle'],
  // Status and accent text on surfaces (SyncStatus, deltas, links).
  ['success', 'surface'],
  ['warning', 'surface'],
  ['danger', 'surface'],
  ['accent-from', 'surface'],
  ['accent-from', 'bg'],
];

describe('contrast', () => {
  it.each(pairs)('%s on %s is at least 4.5:1', (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

/** The focus ring (accent-from) against every surface it can sit on. */
const ringSurfaces: ColorToken[] = ['bg', 'surface', 'surface-raised'];

describe('focus ring', () => {
  it.each(ringSurfaces)('ring is at least 3:1 against %s (WCAG non-text contrast)', (bg) => {
    expect(contrast('accent-from', bg)).toBeGreaterThanOrEqual(3);
  });
});
