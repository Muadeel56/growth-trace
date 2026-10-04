import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

/** Ordered list wrapper for TimelineItems. */
export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return <ol className={cn('flex flex-col', className)}>{children}</ol>;
}

export type TimelineItemProps = {
  icon: ReactNode;
  title: string;
  /** Human-readable time, e.g. "2 hours ago". */
  timestamp: string;
  /** Machine-readable time for <time dateTime>. */
  dateTime: string;
  children?: ReactNode;
};

export function TimelineItem({ icon, title, timestamp, dateTime, children }: TimelineItemProps) {
  return (
    <li className="group relative flex gap-3 pb-6 last:pb-0">
      <span
        aria-hidden
        className="absolute top-8 bottom-0 left-4 w-px bg-border group-last:hidden"
      />
      <span
        aria-hidden
        className="relative z-raised flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-accent-from"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="text-body-sm font-semibold text-text">{title}</p>
          <time dateTime={dateTime} className="text-caption text-muted">
            {timestamp}
          </time>
        </div>
        {children && <div className="text-body-sm text-muted">{children}</div>}
      </div>
    </li>
  );
}
