/**
 * Enforcement fixtures. Kept as plain JS strings (not .tsx files) so the repo's own lint
 * run never sees them as code; enforcement.test.ts lints each one at a virtual path.
 */

const feature = 'frontend/src/features/fixture.tsx';

/** Code that must produce an error from `rule`. */
export const mustFail = [
  {
    name: 'palette class',
    file: feature,
    rule: 'better-tailwindcss/no-unknown-classes',
    code: `export const A = () => <div className="bg-red-500" />;`,
  },
  {
    name: 'arbitrary width',
    file: feature,
    rule: 'aurora/no-arbitrary-values',
    code: `export const A = () => <div className="w-[37px]" />;`,
  },
  {
    name: 'arbitrary colour',
    file: feature,
    rule: 'aurora/no-arbitrary-values',
    code: `export const A = () => <div className="bg-[#ff0000]" />;`,
  },
  {
    name: 'arbitrary property',
    file: feature,
    rule: 'aurora/no-arbitrary-values',
    code: `export const A = () => <div className="[mask-type:alpha]" />;`,
  },
  {
    name: 'arbitrary var shorthand',
    file: feature,
    rule: 'aurora/no-arbitrary-values',
    code: `export const A = () => <div className="p-(--x)" />;`,
  },
  {
    name: 'arbitrary opacity',
    file: feature,
    rule: 'aurora/no-arbitrary-values',
    code: `export const A = () => <div className="bg-accent-from/[0.37]" />;`,
  },
  {
    name: 'arbitrary value in cn()',
    file: 'frontend/src/features/fixture.ts',
    rule: 'aurora/no-arbitrary-values',
    code: `export const c = cn('p-[var(--x)]');`,
  },
  {
    name: 'off-scale colour opacity',
    file: feature,
    rule: 'aurora/no-off-scale-opacity',
    code: `export const A = () => <div className="bg-accent-from/37" />;`,
  },
  {
    name: 'off-scale opacity utility',
    file: feature,
    rule: 'aurora/no-off-scale-opacity',
    code: `export const A = () => <div className="hover:opacity-37" />;`,
  },
  {
    name: 'off-scale spacing',
    file: feature,
    rule: 'better-tailwindcss/no-unknown-classes',
    code: `export const A = () => <div className="p-37" />;`,
  },
  {
    name: 'bare z-index',
    file: feature,
    rule: 'aurora/no-bare-z-index',
    code: `export const A = () => <div className="z-50" />;`,
  },
  {
    name: 'default radius',
    file: feature,
    rule: 'better-tailwindcss/no-unknown-classes',
    code: `export const A = () => <div className="rounded-3xl" />;`,
  },
  {
    name: 'default shadow',
    file: feature,
    rule: 'better-tailwindcss/no-unknown-classes',
    code: `export const A = () => <div className="shadow-2xl" />;`,
  },
  {
    name: 'style prop in a feature',
    file: feature,
    rule: 'aurora/no-style-prop',
    code: `export const A = () => <div style={{ color: 'red' }} />;`,
  },
  {
    name: 'style prop in a design-system component',
    file: 'packages/design-system/src/components/Panel.tsx',
    rule: 'aurora/no-style-prop',
    code: `export const A = () => <div style={{ color: 'red' }} />;`,
  },
  {
    name: 'css import in frontend',
    file: feature,
    rule: 'aurora/no-css-imports',
    code: `import './x.css';\nexport const A = 1;`,
  },
  {
    name: 'css module import',
    file: feature,
    rule: 'aurora/no-css-imports',
    code: `import s from './x.module.css';\nexport const A = s;`,
  },
  {
    name: 'other css import in layout',
    file: 'frontend/src/app/layout.tsx',
    rule: 'aurora/no-css-imports',
    code: `import './globals.css';\nexport const A = 1;`,
  },
  {
    name: 'raw hex colour',
    file: feature,
    rule: 'aurora/no-raw-colors',
    code: `export const A = () => <svg fill="#ff0000" />;`,
  },
  {
    name: 'raw rgb colour',
    file: feature,
    rule: 'aurora/no-raw-colors',
    code: `export const c = 'rgb(255, 0, 0)';\nexport const A = () => <i title={c} />;`,
  },
  {
    name: 'inline motion',
    file: feature,
    rule: 'aurora/no-inline-motion',
    code: `export const A = () => <motion.div animate={{ opacity: 1 }} />;`,
  },
  {
    name: 'eslint-disable of a styling rule',
    file: feature,
    rule: '@eslint-community/eslint-comments/no-restricted-disable',
    code: `// eslint-disable-next-line aurora/no-style-prop\nexport const A = () => <div style={{ color: 'red' }} />;`,
  },
  {
    name: 'blanket eslint-disable',
    file: feature,
    rule: '@eslint-community/eslint-comments/no-restricted-disable',
    code: `/* eslint-disable */\nexport const A = () => <div className="bg-red-500" />;`,
  },
  {
    name: 'inline rule config',
    file: feature,
    rule: '@eslint-community/eslint-comments/no-use',
    code: `/* eslint aurora/no-style-prop: off */\nexport const A = () => <div style={{ color: 'red' }} />;`,
  },
];

/** Code that must produce no styling errors at all. */
export const mustPass = [
  {
    name: 'token classes',
    file: feature,
    code: `export const A = () => <div className="bg-surface text-muted text-display p-4 rounded-md shadow-glow-md z-nav" />;`,
  },
  {
    name: 'token classes in cn/cva',
    file: 'frontend/src/features/fixture.ts',
    code: `export const c = cn('bg-surface-raised px-4 text-body-sm', cva('rounded-full shadow-glow-accent'));`,
  },
  {
    name: 'opacity steps and fractions',
    file: feature,
    code: `export const A = () => <div className="bg-surface/80 opacity-50 hover:bg-bg/70 w-1/2 -translate-y-1/2" />;`,
  },
  {
    name: 'Radix data variant',
    file: feature,
    code: `export const A = () => <div className="data-[state=open]:bg-surface-raised" />;`,
  },
  {
    name: 'style in AuroraBackground',
    file: 'packages/design-system/src/components/AuroraBackground.tsx',
    code: `export const A = () => <div style={{ opacity: 0.5 }} />;`,
  },
  {
    name: 'style in charts',
    file: 'packages/design-system/src/charts/Sparkline.tsx',
    code: `export const A = () => <div style={{ opacity: 0.5 }} />;`,
  },
  {
    name: 'stylesheet import in root layout',
    file: 'frontend/src/app/layout.tsx',
    code: `import '@growthtrace/design-system/styles.css';\nexport const A = 1;`,
  },
  {
    name: 'raw colours in tokens',
    file: 'packages/design-system/src/tokens/Swatch.tsx',
    code: `export const c = 'oklch(0.5 0.1 200)';\nexport const A = () => <i title={c} />;`,
  },
  {
    name: 'motion preset objects',
    file: 'packages/design-system/src/motion/Fade.tsx',
    code: `export const A = () => <motion.div animate={{ opacity: 1 }} />;`,
  },
  {
    name: 'motion via preset reference',
    file: feature,
    code: `export const A = () => <motion.div {...fadeUp} variants={stagger} />;`,
  },
  {
    name: 'in-page anchor',
    file: feature,
    code: `export const A = () => <a href="#main-content">Skip</a>;`,
  },
];
