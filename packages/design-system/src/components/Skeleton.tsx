import { cn } from '../lib/cn';

/** Loading placeholder. Size it with token classes (e.g. `h-4 w-full`). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-md bg-surface-raised motion-ok:animate-shimmer motion-ok:bg-shimmer',
        className,
      )}
    />
  );
}
