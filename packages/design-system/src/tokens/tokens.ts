/**
 * Aurora design tokens for JavaScript (charts, Motion presets, the /design route).
 * Mirrors `tokens.css` name for name and value for value; `tokens.test.ts` fails on drift.
 */
export const tokens = {
  color: {
    bg: 'oklch(0.16 0.02 270)',
    surface: 'oklch(0.2 0.025 270)',
    'surface-raised': 'oklch(0.25 0.03 270)',
    border: 'oklch(0.36 0.035 270)',
    text: 'oklch(0.97 0.01 270)',
    'text-muted': 'oklch(0.76 0.03 270)',
    'accent-from': 'oklch(0.78 0.15 170)',
    'accent-to': 'oklch(0.74 0.14 235)',
    'on-accent': 'oklch(0.18 0.03 270)',
    success: 'oklch(0.8 0.16 150)',
    'success-subtle': 'oklch(0.29 0.05 150)',
    warning: 'oklch(0.86 0.15 85)',
    'warning-subtle': 'oklch(0.3 0.05 85)',
    danger: 'oklch(0.72 0.17 25)',
    'danger-subtle': 'oklch(0.29 0.06 25)',
    'on-danger': 'oklch(0.16 0.02 270)',
    'accent-subtle': 'oklch(0.29 0.05 200)',
    'aurora-1': 'oklch(0.62 0.16 170)',
    'aurora-2': 'oklch(0.55 0.2 280)',
    'aurora-3': 'oklch(0.6 0.19 330)',
    'aurora-4': 'oklch(0.6 0.15 230)',
    'heat-0': 'oklch(0.27 0.025 270)',
    'heat-1': 'oklch(0.42 0.08 170)',
    'heat-2': 'oklch(0.55 0.11 170)',
    'heat-3': 'oklch(0.68 0.14 170)',
    'heat-4': 'oklch(0.82 0.15 170)',
  },
  /** Text-colour aliases: `text-muted` instead of `text-text-muted`. */
  textColor: {
    muted: 'var(--color-text-muted)',
  },
  font: {
    sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  text: {
    display: { size: 'clamp(2rem, 1.25rem + 3vw, 3.5rem)', lineHeight: '1.1', fontWeight: '700' },
    h1: { size: 'clamp(1.75rem, 1.25rem + 2vw, 2.25rem)', lineHeight: '1.2', fontWeight: '700' },
    h2: { size: 'clamp(1.375rem, 1.125rem + 1vw, 1.75rem)', lineHeight: '1.25', fontWeight: '600' },
    h3: { size: '1.375rem', lineHeight: '1.3', fontWeight: '600' },
    'body-lg': { size: '1.125rem', lineHeight: '1.6', fontWeight: '400' },
    body: { size: '1rem', lineHeight: '1.6', fontWeight: '400' },
    'body-sm': { size: '0.875rem', lineHeight: '1.5', fontWeight: '400' },
    caption: { size: '0.75rem', lineHeight: '1.4', fontWeight: '500' },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    /** Minimum tap target below md. */
    touch: '44px',
  },
  container: {
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    sidebar: '15rem',
    md: '28rem',
    lg: '32rem',
    prose: '42rem',
    page: '72rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '1rem',
    full: '9999px',
  },
  /** Allowed opacity steps for `opacity-*` and colour modifiers (`bg-surface/80`). */
  opacity: {
    0: '0%',
    10: '10%',
    20: '20%',
    30: '30%',
    40: '40%',
    50: '50%',
    60: '60%',
    70: '70%',
    80: '80%',
    90: '90%',
    100: '100%',
  },
  shadow: {
    'glow-sm': '0 0 12px -2px color-mix(in oklch, var(--color-accent-from) 30%, transparent)',
    'glow-md': '0 0 28px -6px color-mix(in oklch, var(--color-aurora-2) 45%, transparent)',
    'glow-accent':
      '0 0 32px -6px color-mix(in oklch, var(--color-accent-from) 55%, transparent), 0 0 16px -4px color-mix(in oklch, var(--color-accent-to) 45%, transparent)',
  },
  blur: {
    sm: '8px',
    md: '16px',
    aurora: '80px',
  },
  duration: {
    fast: '150ms',
    base: '250ms',
    slow: '500ms',
    ambient: '30s',
  },
  /** `duration-fast` etc. Tailwind's `duration-*` classes read this namespace. */
  transitionDuration: {
    fast: 'var(--duration-fast)',
    base: 'var(--duration-base)',
    slow: 'var(--duration-slow)',
  },
  ease: {
    'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  animate: {
    'aurora-drift': 'aurora-drift var(--duration-ambient) ease-in-out infinite alternate',
    shimmer: 'shimmer calc(var(--duration-slow) * 3) linear infinite',
    spin: 'spin calc(var(--duration-slow) * 2) linear infinite',
  },
  breakpoint: {
    xs: '360px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  z: {
    base: '0',
    raised: '10',
    nav: '30',
    overlay: '40',
    dialog: '50',
    toast: '60',
    tooltip: '70',
  },
  safeArea: {
    bottom: 'max(var(--spacing-2), env(safe-area-inset-bottom))',
  },
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof Tokens['color'];
export type DurationToken = keyof Tokens['duration'];
export type EaseToken = keyof Tokens['ease'];

/** CSS custom-property prefix for each token group. */
const prefixes = {
  color: '--color-',
  textColor: '--text-color-',
  font: '--font-',
  fontWeight: '--font-weight-',
  spacing: '--spacing-',
  container: '--container-',
  radius: '--radius-',
  opacity: '--opacity-',
  shadow: '--shadow-',
  blur: '--blur-',
  duration: '--duration-',
  transitionDuration: '--transition-duration-',
  ease: '--ease-',
  animate: '--animate-',
  breakpoint: '--breakpoint-',
  z: '--z-',
  safeArea: '--safe-area-',
} as const satisfies Record<Exclude<keyof Tokens, 'text'>, string>;

/** Flattens the tokens into the `--name: value` pairs `tokens.css` declares. */
export function toCssVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [group, prefix] of Object.entries(prefixes)) {
    for (const [name, value] of Object.entries(tokens[group as keyof typeof prefixes])) {
      vars[`${prefix}${name}`] = value;
    }
  }
  for (const [name, { size, lineHeight, fontWeight }] of Object.entries(tokens.text)) {
    vars[`--text-${name}`] = size;
    vars[`--text-${name}--line-height`] = lineHeight;
    vars[`--text-${name}--font-weight`] = fontWeight;
  }
  return vars;
}

/** Duration token in seconds, the unit Motion expects. */
export function seconds(name: DurationToken): number {
  const value = tokens.duration[name];
  return value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value);
}

/** Easing token as the cubic-bezier tuple Motion expects. */
export function bezier(name: EaseToken): [number, number, number, number] {
  const [a = 0, b = 0, c = 1, d = 1] = tokens.ease[name]
    .slice('cubic-bezier('.length, -1)
    .split(',')
    .map(Number);
  return [a, b, c, d];
}
