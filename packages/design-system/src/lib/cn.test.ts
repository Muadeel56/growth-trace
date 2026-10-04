import { expect, it } from 'vitest';

import { cn } from './cn';

it('keeps a font size and a text colour together', () => {
  expect(cn('text-display', 'text-muted')).toBe('text-display text-muted');
});

it('lets the later token win within a group', () => {
  expect(cn('bg-surface p-2', 'bg-surface-raised p-4')).toBe('bg-surface-raised p-4');
  expect(cn('text-body', 'text-caption')).toBe('text-caption');
  expect(cn('z-raised', 'z-nav')).toBe('z-nav');
  expect(cn('duration-fast', 'duration-slow')).toBe('duration-slow');
  expect(cn('rounded-sm shadow-glow-sm', 'rounded-lg shadow-glow-md')).toBe(
    'rounded-lg shadow-glow-md',
  );
});

it('drops falsy values', () => {
  expect(cn('p-4', false, undefined, { 'text-muted': true, 'text-danger': false })).toBe(
    'p-4 text-muted',
  );
});
