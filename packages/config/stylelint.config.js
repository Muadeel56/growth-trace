import { createRequire } from 'node:module';

import strictValue from 'stylelint-declaration-strict-value';

const require = createRequire(import.meta.url);

/**
 * Stylelint for the design-system CSS (the only CSS in the repo). Outside the token
 * definitions, every colour, size, radius, shadow, z-index and duration must be a token
 * (`var(--...)`). tokens.css wraps its `@theme` block in a disable region for this rule,
 * because that block is where raw values become tokens.
 *
 * @type {import('stylelint').Config}
 */
export default {
  extends: [require.resolve('stylelint-config-standard')],
  plugins: [strictValue],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      [
        '/color$/',
        'fill',
        'stroke',
        'background',
        'background-color',
        'border-color',
        'box-shadow',
        'z-index',
        'font-size',
        'line-height',
        'border-radius',
        'gap',
        '/^margin/',
        '/^padding/',
        'transition-duration',
        'animation-duration',
      ],
      {
        ignoreValues: ['inherit', 'currentColor', 'transparent', '0', 'none', 'initial'],
        // Functions like rgb() or calc(12px) are raw values too; only var() is allowed.
        ignoreFunctions: false,
      },
    ],
    // Tailwind v4 at-rules.
    'at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['theme', 'utility', 'variant', 'custom-variant', 'source', 'plugin'] },
    ],
    // `@custom-variant` bodies use `&` for the element the variant applies to.
    'nesting-selector-no-missing-scoping-root': [true, { ignoreAtRules: ['custom-variant'] }],
    'import-notation': 'string',
    // OKLCH tokens use plain numbers (0.16 0.02 270), which tokens.ts and culori share.
    'lightness-notation': 'number',
    'hue-degree-notation': 'number',
    // Font family names are proper nouns.
    'value-keyword-case': ['lower', { ignoreProperties: ['/^--font-/', 'font-family'] }],
    // Tailwind's paired tokens use a double dash: --text-display--line-height.
    'custom-property-pattern': null,
  },
};
