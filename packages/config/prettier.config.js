/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  // Sort Tailwind classes inside these helpers too, not just `class`/`className`.
  tailwindFunctions: ['cn', 'clsx', 'cva', 'twMerge'],
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
