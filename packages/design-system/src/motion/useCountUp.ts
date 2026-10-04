'use client';

import { animate, useReducedMotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';

import { countUp } from './presets';

/**
 * Animates a number from 0 to `value`; jumps straight there when motion is reduced.
 * The first render is always 0 so server and client markup match.
 */
export function useCountUp(value: number): number {
  const reduce = useReducedMotionConfig() ?? false;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (reduce) {
      setCurrent(value);
      return;
    }
    const controls = animate(0, value, { ...countUp, onUpdate: setCurrent });
    return () => controls.stop();
  }, [value, reduce]);

  return current;
}
