import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

const bubble = cva('max-w-prose rounded-lg px-4 py-3 text-body text-text', {
  variants: {
    from: {
      user: 'rounded-br-sm bg-surface-raised',
      assistant: 'rounded-bl-sm border border-border bg-surface/80 backdrop-blur-md',
    },
  },
});

export type ChatBubbleProps = {
  from: 'user' | 'assistant';
  /** True while tokens are still arriving: shows a shimmer and marks the region busy. */
  streaming?: boolean;
  children: ReactNode;
  className?: string;
};

export function ChatBubble({ from, streaming = false, children, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        from === 'user' ? 'items-end' : 'items-start',
        className,
      )}
    >
      <span className="text-caption text-muted">{from === 'user' ? 'You' : 'GrowthTrace'}</span>
      <div className={bubble({ from })}>
        <div aria-live="polite" aria-busy={streaming}>
          {children}
        </div>
        {streaming && (
          <span className="mt-2 flex items-center">
            <span
              aria-hidden
              className="h-2 w-12 rounded-full bg-surface-raised motion-ok:animate-shimmer motion-ok:bg-shimmer"
            />
            <span className="sr-only">Generating response</span>
          </span>
        )}
      </div>
    </div>
  );
}
