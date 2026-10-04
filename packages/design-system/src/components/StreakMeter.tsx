import { Flame, Trophy } from 'lucide-react';

import { cn } from '../lib/cn';

export type StreakMeterProps = {
  current: number;
  best: number;
  unit?: string;
  /** Number of segments in the meter. */
  segments?: number;
  className?: string;
};

/** Current versus best streak, as text and a segmented meter. */
export function StreakMeter({
  current,
  best,
  unit = 'days',
  segments = 10,
  className,
}: StreakMeterProps) {
  const max = Math.max(best, current, 1);
  const filled = Math.round((current / max) * segments);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-body-sm text-muted">
          <Flame aria-hidden className="size-4 text-warning" />
          Current streak
        </p>
        <p className="flex items-center gap-1 text-caption text-muted">
          <Trophy aria-hidden className="size-3" />
          Best {best} {unit}
        </p>
      </div>
      <p className="text-h2 text-text">
        {current} {unit}
      </p>
      <div
        role="meter"
        aria-label="Current streak"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${current} of ${max} ${unit}`}
        className="flex gap-1"
      >
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full',
              i < filled ? 'bg-accent-gradient' : 'bg-surface-raised',
            )}
          />
        ))}
      </div>
    </div>
  );
}
