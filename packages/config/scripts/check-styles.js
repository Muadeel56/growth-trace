#!/usr/bin/env node
/**
 * Fails if a stylesheet exists outside packages/design-system/. ESLint only sees CSS
 * that something imports, so an orphan `foo.module.css` would otherwise slip through.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STYLESHEET = /\.(?:css|scss|sass|less)$/;
const ALLOWED_DIR = path.join('packages', 'design-system');
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.next-e2e',
  'dist',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  'blob-report',
  '.turbo',
]);

/** Repo-relative paths of every stylesheet under `root` that lives outside the design system. */
export function findStrayStylesheets(root) {
  const stray = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && rel !== ALLOWED_DIR) walk(full);
      } else if (STYLESHEET.test(entry.name)) {
        stray.push(rel);
      }
    }
  };
  walk(root);
  return stray.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, '../../..'));
  const stray = findStrayStylesheets(root);
  if (stray.length > 0) {
    console.error(
      'Stylesheets are only allowed in packages/design-system/. Move these into the design system as tokens or components:',
    );
    for (const file of stray) console.error(`  ${file}`);
    process.exit(1);
  }
  console.log('check:styles: no stylesheets outside packages/design-system/');
}
