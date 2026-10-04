/**
 * Motion presets. Components spread these instead of declaring `initial`, `animate` or
 * `transition` objects inline (lint enforces it). Timings come from the Aurora tokens.
 */
import { bezier, seconds, tokens } from '../tokens/tokens';

const rise = parseFloat(tokens.spacing[2]);

/** Fade in while rising a little. Use on a single element or as a `stagger` child. */
export const fadeUp = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  variants: {
    hidden: { opacity: 0, y: rise },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: seconds('base'), ease: bezier('out-expo') },
    },
  },
} as const;

/** Parent that reveals `fadeUp` children one after another. */
export const stagger = {
  initial: 'hidden',
  animate: 'visible',
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: seconds('fast') / 3 } },
  },
} as const;

/** Child of `stagger`: same motion as `fadeUp`, driven by the parent. */
export const staggerItem = { variants: fadeUp.variants } as const;

/** Small lift on hover and press for interactive surfaces. */
export const glowHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: seconds('fast'), ease: bezier('spring') },
} as const;

/** Timing for `useCountUp`. */
export const countUp = { duration: seconds('slow') * 2, ease: bezier('out-expo') } as const;
