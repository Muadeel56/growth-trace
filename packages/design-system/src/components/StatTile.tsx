'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { Sparkline } from '../charts/Sparkline';
import { cn } from '../lib/cn';
import { useCountUp } from '../motion/useCountUp';
import { Badge } from './Badge';
import { Panel } from './Panel';

const defaultFormat = (n: number) => Math.round(n).toLocaleString('en-US');

export type StatTileProps = {
  label: string;
  value: number;
  /** Percentage change versus the previous period. */
  delta?: number;
  /** Optional sparkline values, oldest first. */
  trend?: number[];
  format?: (n: number) => string;
  className?: string;
};

export function StatTile({
  label,
  value,
  delta,
  trend,
  format = defaultFormat,
  className,
}: StatTileProps) {
  const shown = useCountUp(value);
  const up = (delta ?? 0) >= 0;

  return (
    <Panel className={cn('flex flex-col gap-2', className)}>
      <p className="text-body-sm text-muted">{label}</p>
      {/* Stacks in narrow slots; from @xs (320px of tile) value and delta share a row. */}
      <div className="flex flex-col items-start gap-2 @xs:flex-row @xs:items-end @xs:justify-between @xs:gap-3">
        <p className="text-h1 text-text tabular-nums @xs:text-display">
          <span aria-hidden>{format(shown)}</span>
          <span className="sr-only">{format(value)}</span>
        </p>
        {delta !== undefined && (
          <Badge tone={up ? 'success' : 'danger'}>
            {up ? (
              <ArrowUp aria-hidden className="size-3" />
            ) : (
              <ArrowDown aria-hidden className="size-3" />
            )}
            <span>
              {up ? '+' : ''}
              {delta}%
            </span>
            <span className="sr-only">{up ? 'increase' : 'decrease'} versus last period</span>
          </Badge>
        )}
      </div>
      {trend && trend.length > 1 && (
        <Sparkline data={trend} label={`${label} trend`} tone={up ? 'accent' : 'danger'} />
      )}
    </Panel>
  );
}
