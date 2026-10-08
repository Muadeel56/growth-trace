import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const panel = cva('rounded-lg border border-border backdrop-blur-md', {
  variants: {
    tone: { surface: 'bg-surface/80', raised: 'bg-surface-raised/80' },
    glow: { true: 'shadow-glow-md', false: '' },
    padding: { none: '', sm: 'p-3', md: 'p-4 md:p-6' },
    // A query container, so children adapt to the panel's width (@xs:, @sm:...), not the
    // viewport's. Opt out inside content-sized parents (w-max, inline-flex), where
    // `container-type: inline-size` would collapse the panel to zero width.
    container: { true: '@container', false: '' },
  },
  defaultVariants: { tone: 'surface', glow: false, padding: 'md', container: true },
});

export type PanelProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof panel> & {
    /** Render the single child (e.g. a <section>) as the panel. */
    asChild?: boolean;
  };

/** Frosted surface: the base container for cards, tiles and sheets. */
export function Panel({
  tone,
  glow,
  padding,
  container,
  asChild = false,
  className,
  ...props
}: PanelProps) {
  const Comp = asChild ? Slot.Root : 'div';
  return <Comp className={cn(panel({ tone, glow, padding, container }), className)} {...props} />;
}
