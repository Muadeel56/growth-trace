import { wcagContrast } from 'culori';

import { type ColorToken, tokens } from './tokens';

/** WCAG contrast ratio between two colour tokens. */
export function contrast(fg: ColorToken, bg: ColorToken): number {
  return wcagContrast(tokens.color[fg], tokens.color[bg]);
}
