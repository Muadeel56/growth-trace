'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

type ReducedMotion = 'user' | 'always' | 'never';

/**
 * Wrap the app once. Motion follows the viewer's reduced-motion setting by default;
 * `reducedMotion="always"` also stops the CSS `motion-ok:` animations below it.
 */
export function AuroraMotionProvider({
  children,
  reducedMotion = 'user',
}: {
  children: ReactNode;
  reducedMotion?: ReducedMotion;
}) {
  return (
    <MotionConfig reducedMotion={reducedMotion}>
      <div data-reduced-motion={reducedMotion} className="contents">
        {children}
      </div>
    </MotionConfig>
  );
}
