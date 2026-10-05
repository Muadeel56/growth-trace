'use client';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';
import { Tooltip, TooltipProvider } from './Tooltip';

export type HeatmapDay = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  count: number;
};

const levels = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const;

const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function levelOf(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}

/** Keyboard step for each key in a column-per-week grid (7 rows). */
const STEP: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };

export type ActivityHeatmapProps = {
  /** Consecutive days, oldest first. */
  days: HeatmapDay[];
  label?: string;
  unit?: string;
  className?: string;
};

/**
 * GitHub-style activity grid. Each cell is a button with its own label and tooltip
 * (never colour alone); arrow keys move between days, Home/End jump to the ends.
 *
 * The grid scrolls sideways inside its own container and starts scrolled to the most
 * recent week. Cells are exempt from the 44px tap-target rule (`data-tap-exempt`): the
 * grid is one tab stop with roving focus, and the summary text carries the same data.
 */
export function ActivityHeatmap({
  days,
  label = 'Activity',
  unit = 'contribution',
  className,
}: ActivityHeatmapProps) {
  const summaryId = useId();
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  // Phones show the latest weeks first; older ones are a swipe to the left.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);
  const [active, setActive] = useState(Math.max(0, days.length - 1));

  const max = Math.max(0, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const offset = days[0] ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;

  const move = (event: KeyboardEvent, index: number) => {
    let next = index + (STEP[event.key] ?? 0);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = days.length - 1;
    if (next === index || next < 0 || next >= days.length) return;
    event.preventDefault();
    setActive(next);
    cells.current[next]?.focus();
  };

  return (
    <div data-chart className={cn('flex flex-col gap-3', className)}>
      <p id={summaryId} className="text-body-sm text-muted">
        {plural(total, unit)} across {plural(activeDays, 'active day')} in the last{' '}
        {plural(days.length, 'day')}.
      </p>
      <div ref={scroller} className="overflow-x-auto pb-2">
        <TooltipProvider>
          <div
            role="group"
            aria-label={label}
            aria-describedby={summaryId}
            className="grid w-max grid-flow-col grid-rows-7 gap-1 p-1"
          >
            {Array.from({ length: offset }, (_, i) => (
              <span key={`pad-${i}`} aria-hidden className="size-3" />
            ))}
            {days.map((day, index) => {
              const text = `${plural(day.count, unit)} on ${dayFormat.format(new Date(`${day.date}T00:00:00Z`))}`;
              return (
                <Tooltip key={day.date} content={text}>
                  <button
                    ref={(el) => {
                      cells.current[index] = el;
                    }}
                    type="button"
                    aria-label={text}
                    data-tap-exempt="composite-grid"
                    tabIndex={index === active ? 0 : -1}
                    onFocus={() => setActive(index)}
                    onKeyDown={(event) => move(event, index)}
                    className={cn('size-3 rounded-sm', levels[levelOf(day.count, max)], focusRing)}
                  />
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
      <div aria-hidden className="flex items-center gap-1 self-end text-caption text-muted">
        <span className="mr-1">Less</span>
        {levels.map((level) => (
          <span key={level} className={cn('size-3 rounded-sm', level)} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}
