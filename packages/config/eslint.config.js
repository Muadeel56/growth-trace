import { readFileSync } from 'node:fs';
import path from 'node:path';

import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import aurora from './eslint-rules/index.js';

/** Repo root, so `projectService` finds each workspace tsconfig no matter where ESLint runs. */
const tsconfigRootDir = path.resolve(import.meta.dirname, '../..');

/** Workspaces that ship browser-facing code. */
const clientFiles = [
  'frontend/**/*.{ts,tsx,js,jsx}',
  'packages/design-system/**/*.{ts,tsx,js,jsx}',
];

/** The Aurora stylesheet: the only Tailwind theme, so anything it doesn't define is unregistered. */
const auroraEntryPoint = path.resolve(import.meta.dirname, '../design-system/src/styles.css');

/** Opacity steps defined in tokens.css (`--opacity-<n>`); anything else is off-scale. */
const opacitySteps = [
  ...readFileSync(
    path.resolve(import.meta.dirname, '../design-system/src/tokens/tokens.css'),
    'utf8',
  ).matchAll(/--opacity-(\d+):/g),
].map(([, step]) => step);

/** The single stylesheet import allowed outside the design system (frontend root layout). */
const auroraStylesheet = '@growthtrace/design-system/styles.css';

/** Styling rules that `eslint-disable` comments may not switch off. */
const lockedRules = ['aurora/*', 'better-tailwindcss/*'];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/.next',
      '**/.next-e2e',
      '**/coverage',
      'playwright-report',
      'test-results',
      'blob-report',
      '**/*.tsbuildinfo',
    ],
  },

  // Baseline TypeScript rules everywhere, including root-level config files.
  ...tseslint.configs.recommended,

  // Type-aware rules only for workspace source, which is what the tsconfigs cover.
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: [
      'backend/src/**/*.{ts,tsx}',
      'frontend/src/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
    ],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: { projectService: true, tsconfigRootDir },
    },
  })),

  // Unused imports and variables. `unused-imports` owns this, so the
  // typescript-eslint equivalent is off to avoid double reporting.
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: { 'unused-imports': unusedImports },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  { files: ['backend/**/*.{ts,js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  { files: clientFiles, languageOptions: { globals: globals.browser } },

  // React hooks: frontend and the design system only.
  {
    files: clientFiles,
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Next.js: frontend only.
  {
    files: ['frontend/**/*.{ts,tsx,js,jsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // App Router project: there is no `pages/` directory, and this rule warns on
      // stderr every run while looking for one.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // Aurora styling enforcement. Allowlists live here, never in disable comments.
  // ---------------------------------------------------------------------------
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },

  // Tokens only: any class the Aurora theme doesn't generate is an error. (v4 of the
  // plugin renamed `no-unregistered-classes` to `no-unknown-classes`.) (bg-red-500,
  // p-37, rounded-3xl, shadow-2xl...). Checks className and cn/clsx/cva/twMerge calls.
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: { 'better-tailwindcss': { entryPoint: auroraEntryPoint } },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-concatenated-classes': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
    },
  },

  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: { aurora },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'aurora/no-arbitrary-values': 'error',
      'aurora/no-bare-z-index': 'error',
      'aurora/no-desktop-first': 'error',
      'aurora/no-off-scale-opacity': ['error', { steps: opacitySteps }],
    },
  },
  {
    files: ['**/*.tsx'],
    ignores: ['**/AuroraBackground.tsx', 'packages/design-system/src/charts/**'],
    rules: { 'aurora/no-style-prop': 'error' },
  },
  {
    files: ['**/*.tsx'],
    ignores: ['packages/design-system/src/tokens/**'],
    rules: { 'aurora/no-raw-colors': 'error' },
  },
  {
    files: ['**/*.tsx'],
    ignores: ['packages/design-system/src/motion/**'],
    rules: { 'aurora/no-inline-motion': 'error' },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: ['packages/design-system/**'],
    rules: { 'aurora/no-css-imports': 'error' },
  },
  {
    files: ['frontend/src/app/layout.tsx'],
    rules: { 'aurora/no-css-imports': ['error', { allow: [auroraStylesheet] }] },
  },

  // Make the rules above impossible to switch off locally.
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: { '@eslint-community/eslint-comments': eslintComments },
    rules: {
      '@eslint-community/eslint-comments/no-restricted-disable': ['error', ...lockedRules],
      // Inline `/* eslint rule: off */` config would bypass the restriction above.
      '@eslint-community/eslint-comments/no-use': [
        'error',
        {
          allow: [
            'eslint-disable',
            'eslint-disable-line',
            'eslint-disable-next-line',
            'eslint-enable',
            'global',
            'globals',
          ],
        },
      ],
    },
  },

  // Must stay last: drops every rule that would fight Prettier.
  prettierConfig,
);
