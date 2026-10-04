import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { toCssVars } from './tokens';

/** Every `--name: value;` declared in tokens.css, whitespace-normalised. */
function parseCssVars(): Record<string, string> {
  const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  const vars: Record<string, string> = {};
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (name === '--*' || !name || !value) continue;
    vars[name] = value.replace(/\s+/g, ' ').trim();
  }
  return vars;
}

describe('token parity', () => {
  const css = parseCssVars();
  const ts = toCssVars();

  it('every tokens.ts token exists in tokens.css with the same value', () => {
    for (const [name, value] of Object.entries(ts)) {
      expect(css[name], name).toBe(value);
    }
  });

  it('every tokens.css token exists in tokens.ts', () => {
    expect(Object.keys(css).sort()).toEqual(Object.keys(ts).sort());
  });
});
