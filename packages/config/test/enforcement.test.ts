import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ESLint } from 'eslint';
import stylelint from 'stylelint';
import tseslint from 'typescript-eslint';
import { afterAll, describe, expect, it } from 'vitest';

import stylelintConfig from '../stylelint.config.js';
import { findStrayStylesheets } from '../scripts/check-styles.js';
import { mustFail, mustPass } from './fixtures.js';

const repoRoot = path.resolve(import.meta.dirname, '../../..');

const eslint = new ESLint({
  cwd: repoRoot,
  // Fixture paths are virtual, so type-aware rules (which need a real tsconfig entry) are off.
  overrideConfig: { files: ['**/*.{ts,tsx}'], ...tseslint.configs.disableTypeChecked },
});

const STYLING_RULE = /^(aurora\/|better-tailwindcss\/|@eslint-community\/eslint-comments\/)/;

async function lint(code: string, file: string) {
  const [result] = await eslint.lintText(code, { filePath: path.join(repoRoot, file) });
  return result!.messages.filter((m) => m.ruleId && STYLING_RULE.test(m.ruleId));
}

describe('ESLint styling enforcement', () => {
  it.each(mustFail)('rejects: $name', async ({ code, file, rule }) => {
    const messages = await lint(code, file);
    expect(messages.map((m) => m.ruleId)).toContain(rule);
    expect(messages.every((m) => m.severity === 2)).toBe(true);
  });

  it.each(mustPass)('allows: $name', async ({ code, file }) => {
    expect(await lint(code, file)).toEqual([]);
  });
});

describe('Stylelint on design-system CSS', () => {
  const lintCss = (code: string) =>
    stylelint.lint({
      code,
      codeFilename: path.join(repoRoot, 'packages/design-system/src/x.css'),
      config: stylelintConfig,
    });

  it('rejects a raw colour outside @theme', async () => {
    const { results } = await lintCss('.panel {\n  color: #fff;\n}\n');
    const rules = results[0]!.warnings.map((w) => w.rule);
    expect(rules).toContain('scale-unlimited/declaration-strict-value');
  });

  it('rejects raw sizes outside @theme', async () => {
    const { results } = await lintCss('.panel {\n  padding: 13px;\n  border-radius: 3px;\n}\n');
    const rules = results[0]!.warnings.map((w) => w.rule);
    expect(rules.filter((r) => r === 'scale-unlimited/declaration-strict-value')).toHaveLength(2);
  });

  it('allows token references', async () => {
    const { results } = await lintCss(
      '.panel {\n  color: var(--color-text);\n  padding: var(--spacing-4);\n}\n',
    );
    expect(results[0]!.warnings).toEqual([]);
  });
});

describe('check:styles', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'check-styles-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const touch = (rel: string) => {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), '');
  };

  it('allows stylesheets inside packages/design-system and ignores node_modules', () => {
    touch('packages/design-system/src/styles.css');
    touch('node_modules/some-lib/dist/lib.css');
    touch('frontend/.next/static/app.css');
    expect(findStrayStylesheets(root)).toEqual([]);
  });

  it('rejects a stray CSS module in frontend', () => {
    touch('frontend/src/foo.module.css');
    expect(findStrayStylesheets(root)).toEqual([path.join('frontend', 'src', 'foo.module.css')]);
  });
});
