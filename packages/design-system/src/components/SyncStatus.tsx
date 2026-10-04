import { CircleCheck, CircleDashed, LoaderCircle, TriangleAlert, WifiOff } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '../lib/cn';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

const states: Record<
  SyncState,
  {
    icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    label: string;
    tone: string;
  }
> = {
  idle: { icon: CircleDashed, label: 'Not synced yet', tone: 'text-muted' },
  syncing: { icon: LoaderCircle, label: 'Syncing', tone: 'text-accent-from' },
  synced: { icon: CircleCheck, label: 'Synced', tone: 'text-success' },
  error: { icon: TriangleAlert, label: 'Sync failed', tone: 'text-danger' },
  offline: { icon: WifiOff, label: 'Offline', tone: 'text-warning' },
};

export type SyncStatusProps = {
  state: SyncState;
  /** Extra context, e.g. "2 min ago". */
  detail?: string;
  className?: string;
};

/** GitHub sync state as icon plus text (never colour alone). */
export function SyncStatus({ state, detail, className }: SyncStatusProps) {
  const { icon: Icon, label, tone } = states[state];
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-2 text-body-sm whitespace-nowrap',
        tone,
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn('size-4 shrink-0', state === 'syncing' && 'motion-ok:animate-spin')}
      />
      <span>{label}</span>
      {detail && <span className="hidden text-muted sm:inline">· {detail}</span>}
    </span>
  );
}
