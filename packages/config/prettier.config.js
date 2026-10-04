import path from 'node:path';

/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  // Sort Tailwind classes inside these helpers too, not just `class`/`className`.
  tailwindFunctions: ['cn', 'clsx', 'cva', 'twMerge'],
  // Tailwind v4: read the Aurora theme so custom tokens sort like built-in classes.
  tailwindStylesheet: path.resolve(import.meta.dirname, '../design-system/src/styles.css'),
  // prettier-plugin-tailwindcss must be last: it wraps the other plugins' printers.
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      // Double quotes are the YAML convention, and Compose/CI files read better with them.
      files: ['*.{yml,yaml}'],
      options: { singleQuote: false },
    },
  ],
};
