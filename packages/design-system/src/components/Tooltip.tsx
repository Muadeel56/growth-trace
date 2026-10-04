'use client';

import { Tooltip as RadixTooltip } from 'radix-ui';
import type { ReactNode } from 'react';

/** Share one provider across many tooltips (e.g. a heatmap) so they open without delay chains. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={200} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  );
}

export type TooltipProps = {
  content: ReactNode;
  /** A single focusable element; it becomes the trigger. */
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-tooltip rounded-sm border border-border bg-surface-raised px-2 py-1 text-caption text-text shadow-glow-sm"
        >
          {content}
          <RadixTooltip.Arrow className="fill-surface-raised" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
