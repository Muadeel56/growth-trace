import {
  ActivityHeatmap,
  Button,
  ChatBubble,
  Panel,
  Skeleton,
  StatTile,
  StreakMeter,
  type SyncState,
  SyncStatus,
  Timeline,
  TimelineItem,
} from '@growthtrace/design-system';
import { GitCommitHorizontal, GitPullRequest, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { sampleActivity, sampleTrend } from '../lib/sample-data';

/** Every state the dashboard renders. Each one is shown on /design. */
export type DashboardState = 'ready' | 'loading' | 'empty' | 'error';

/** The header sync indicator that goes with each dashboard state. */
export const dashboardSync: Record<DashboardState, { state: SyncState; detail?: string }> = {
  ready: { state: 'synced', detail: '2 min ago' },
  loading: { state: 'syncing' },
  empty: { state: 'idle' },
  error: { state: 'error', detail: 'GitHub unreachable' },
};

/** Dashboard body for `state`: sample data until real GitHub history lands. */
export function DashboardContent({ state }: { state: DashboardState }) {
  switch (state) {
    case 'loading':
      return <DashboardLoading />;
    case 'empty':
      return <DashboardEmpty />;
    case 'error':
      return <DashboardError />;
    case 'ready':
      return <DashboardReady />;
  }
}

function DashboardReady() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Commits" value={342} delta={12} trend={sampleTrend} />
        <StatTile label="Pull requests merged" value={27} delta={-4} />
        <Panel>
          <StreakMeter current={9} best={21} />
        </Panel>
      </div>

      <Panel id="activity" className="flex flex-col gap-4">
        <h2 className="text-h3 text-text">Activity</h2>
        <ActivityHeatmap days={sampleActivity(182)} label="Contributions, last 26 weeks" />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel id="timeline" className="flex flex-col gap-4">
          <h2 className="text-h3 text-text">Timeline</h2>
          <Timeline>
            <TimelineItem
              icon={<GitPullRequest className="size-4" />}
              title="Merged #42 into main"
              timestamp="2 hours ago"
              dateTime="2026-09-30T10:00:00Z"
            >
              Phase 1 tooling landed.
            </TimelineItem>
            <TimelineItem
              icon={<GitCommitHorizontal className="size-4" />}
              title="12 commits to growth-trace"
              timestamp="Yesterday"
              dateTime="2026-09-29"
            />
          </Timeline>
        </Panel>
        <Panel id="assistant" className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-h3 text-text">
            <Sparkles aria-hidden className="size-6 text-accent-from" />
            Assistant
          </h2>
          <ChatBubble from="user">What did I ship last week?</ChatBubble>
          <ChatBubble from="assistant" streaming>
            You merged 6 pull requests, mostly around repo tooling
          </ChatBubble>
          <Button asChild variant="ghost" size="sm" className="self-start">
            <Link href="/design">Open the design system</Link>
          </Button>
        </Panel>
      </div>
    </>
  );
}

/** Same layout as the ready state, so nothing jumps when data arrives. */
function DashboardLoading() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <span className="sr-only" role="status">
        Loading your activity
      </span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['commits', 'pull-requests', 'streak'].map((tile) => (
          <Panel key={tile} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-2/3" />
          </Panel>
        ))}
      </div>
      <Panel className="flex flex-col gap-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        {['timeline', 'assistant'].map((panel) => (
          <Panel key={panel} className="flex flex-col gap-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Panel>
        ))}
      </div>
    </div>
  );
}

function DashboardEmpty() {
  return (
    <Panel className="flex flex-col items-start gap-3">
      <SyncStatus state="idle" />
      <h2 className="text-h3 text-text">No activity yet</h2>
      <p className="max-w-prose text-body text-muted">
        Your first GitHub sync hasn&apos;t finished. Commits, pull requests and streaks show up here
        as soon as it does.
      </p>
    </Panel>
  );
}

function DashboardError() {
  return (
    <Panel className="flex flex-col items-start gap-3">
      <SyncStatus state="error" detail="GitHub unreachable" />
      <h2 className="text-h3 text-text">We couldn&apos;t load your activity</h2>
      <p className="max-w-prose text-body text-muted">
        The last sync with GitHub failed. Your data is safe; try again in a moment.
      </p>
      <Button asChild variant="ghost" size="sm">
        <Link href="/">Try again</Link>
      </Button>
    </Panel>
  );
}
