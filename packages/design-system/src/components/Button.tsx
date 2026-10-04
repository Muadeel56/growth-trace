import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';
import { Spinner } from './Spinner';

const button = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap',
    'transition duration-fast ease-out-expo disabled:pointer-events-none disabled:opacity-50',
    focusRing,
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent-gradient text-on-accent hover:shadow-glow-accent',
        ghost: 'border border-border bg-transparent text-text hover:bg-surface-raised',
        danger: 'bg-danger text-on-danger hover:shadow-glow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-body-sm',
        md: 'h-10 px-4 text-body',
        lg: 'h-12 px-6 text-body-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    /** Render the single child (e.g. a link) with button styling instead of a <button>. */
    asChild?: boolean;
    /** Shows a spinner, disables the button and sets aria-busy. */
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot.Root className={cn(button({ variant, size }), className)} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      type={type ?? 'button'}
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner size="sm" label="Loading" />}
      {children}
    </button>
  );
}
