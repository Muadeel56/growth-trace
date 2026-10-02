import { expect, it } from 'vitest';

import { name } from './index.js';

it('exposes the package name', () => {
  expect(name).toBe('@growthtrace/backend');
});
