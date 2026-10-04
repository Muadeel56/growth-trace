import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { tokens } from '../tokens/tokens';

const names = (group: object) => Object.keys(group);

/**
 * tailwind-merge taught the Aurora theme. Without this it can't tell `text-display`
 * (a font size) from `text-muted` (a colour) and silently drops one of them.
 */
const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: [...names(tokens.color), ...names(tokens.textColor)],
      text: names(tokens.text),
      font: names(tokens.font),
      'font-weight': names(tokens.fontWeight),
      spacing: names(tokens.spacing),
      container: names(tokens.container),
      radius: names(tokens.radius),
      shadow: names(tokens.shadow),
      blur: names(tokens.blur),
      ease: names(tokens.ease),
      animate: names(tokens.animate),
      breakpoint: names(tokens.breakpoint),
    },
    classGroups: {
      z: [{ z: names(tokens.z) }],
      duration: [{ duration: names(tokens.transitionDuration) }],
    },
  },
});

/** Joins class names and resolves Tailwind conflicts (last one wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
