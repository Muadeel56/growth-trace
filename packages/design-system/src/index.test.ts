import { expect, it } from 'vitest';

import * as ds from './index';

it('exports the Aurora building blocks', () => {
  for (const name of ['Button', 'Panel', 'AppShell', 'ActivityHeatmap', 'cn', 'fadeUp']) {
    expect(ds).toHaveProperty(name);
  }
});

it('builds avatar initials', () => {
  expect(ds.initials('Ada Lovelace')).toBe('AL');
  expect(ds.initials('grace')).toBe('G');
});
