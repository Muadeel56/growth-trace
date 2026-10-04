import type { HeatmapDay } from '@growthtrace/design-system';

/** Deterministic pseudo-random sequence so server and client render the same sample data. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** `count` days of fake activity ending on `end` (YYYY-MM-DD). */
export function sampleActivity(count: number, end = '2026-09-30'): HeatmapDay[] {
  const random = seeded(42);
  const last = new Date(`${end}T00:00:00Z`).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(last - (count - 1 - i) * dayMs).toISOString().slice(0, 10);
    const roll = random();
    return { date, count: roll < 0.3 ? 0 : Math.floor(roll * roll * 12) };
  });
}

export const sampleTrend = [3, 5, 4, 8, 6, 9, 7, 11, 10, 14, 12, 15];
