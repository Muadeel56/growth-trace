import { expect, it } from 'vitest';

import { name } from './index';

it('exposes the package name', () => {
  expect(name).toBe('@growthtrace/frontend');
});
