import path from 'node:path';

import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Repo root, so `projectService` finds each workspace tsconfig no matter where ESLint runs. */
const tsconfigRootDir = path.resolve(import.meta.dirname, '../..');

/** Workspaces that ship browser-facing code. */
const clientFiles = ['frontend/**/*.{ts,tsx,js,jsx}', 'packages/ui/**/*.{ts,tsx,js,jsx}'];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/.next',
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

  // Must stay last: drops every rule that would fight Prettier.
  prettierConfig,
);
