import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/cn';

const spinner = cva(
  'inline-block rounded-full border-2 border-current border-t-transparent motion-ok:animate-spin',
  {
    variants: { size: { sm: 'size-4', md: 'size-6', lg: 'size-8' } },
    defaultVariants: { size: 'md' },
  },
);

export type SpinnerProps = VariantProps<typeof spinner> & {
  /** Announced to screen readers. */
  label?: string;
  className?: string;
};

export function Spinner({ label = 'Loading', size, className }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center', className)}>
      <span aria-hidden className={spinner({ size })} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
