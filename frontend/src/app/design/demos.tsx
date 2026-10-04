'use client';

import {
  AuroraBackground,
  AuroraMotionProvider,
  Button,
  cn,
  focusRing,
  glowHover,
  motion,
  Skeleton,
  StatTile,
  stagger,
  staggerItem,
  useToast,
} from '@growthtrace/design-system';
import { useState } from 'react';

const presets = ['fadeUp', 'stagger', 'glowHover'];

/** Live motion presets with a local reduced-motion toggle. */
export function MotionDemo() {
  const [reduced, setReduced] = useState(false);
  const [run, setRun] = useState(0);

  return (
    <AuroraMotionProvider reducedMotion={reduced ? 'always' : 'user'}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}>
            Replay
          </Button>
          <label className="flex items-center gap-2 text-body-sm text-text">
            <input
              type="checkbox"
              checked={reduced}
              onChange={(event) => setReduced(event.target.checked)}
              className={cn('size-4 accent-accent-from', focusRing)}
            />
            Reduce motion
          </label>
        </div>
        <motion.ul key={`list-${run}`} {...stagger} className="grid gap-3 sm:grid-cols-3">
          {presets.map((name) => (
            <motion.li
              key={name}
              variants={staggerItem.variants}
              {...glowHover}
              className="rounded-md border border-border bg-surface-raised p-4 font-mono text-body-sm text-text"
            >
              {name}
            </motion.li>
          ))}
        </motion.ul>
        <StatTile key={`count-${run}`} label="countUp" value={1280} />
        <div className="relative isolate flex h-24 flex-col justify-end gap-2 overflow-hidden rounded-lg border border-border p-4">
          <AuroraBackground />
          <Skeleton className="relative z-raised h-4 w-full" />
          <Skeleton className="relative z-raised h-4 w-1/2" />
        </div>
      </div>
    </AuroraMotionProvider>
  );
}

/** Buttons that fire each toast tone. */
export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toast({ title: 'Saved', description: 'Your settings were updated.' })}
      >
        Neutral toast
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          toast({ title: 'Synced', description: '42 new commits imported.', tone: 'success' })
        }
      >
        Success toast
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          toast({ title: 'Sync failed', description: 'GitHub rate limit hit.', tone: 'danger' })
        }
      >
        Danger toast
      </Button>
    </div>
  );
}
