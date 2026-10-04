import { tokens } from '../tokens/tokens';

/** Chart colours. Charts read these (never raw strings) so they follow the Aurora tokens. */
export const chartColors = {
  accent: tokens.color['accent-from'],
  success: tokens.color.success,
  danger: tokens.color.danger,
  grid: tokens.color.border,
  axis: tokens.color['text-muted'],
  series: [
    tokens.color['aurora-1'],
    tokens.color['aurora-2'],
    tokens.color['aurora-3'],
    tokens.color['aurora-4'],
  ],
} as const;

export type ChartTone = 'accent' | 'success' | 'danger';
