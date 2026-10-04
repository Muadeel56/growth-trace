'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

import { type ChartTone, chartColors } from './theme';

export type SparklineProps = {
  data: number[];
  /** Describes the trend for screen readers, e.g. "Commits per day, last 14 days". */
  label: string;
  tone?: ChartTone;
};

/** Minimal trend line (Recharts) for tiles. */
export function Sparkline({ data, label, tone = 'accent' }: SparklineProps) {
  const points = data.map((value, index) => ({ index, value }));
  return (
    <div role="img" aria-label={label} className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 160, height: 40 }}>
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartColors[tone]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
