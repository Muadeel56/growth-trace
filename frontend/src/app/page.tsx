import {
  ActivityHeatmap,
  AppShell,
  AuroraBackground,
  Avatar,
  Button,
  ChatBubble,
  Panel,
  StatTile,
  StreakMeter,
  SyncStatus,
  Timeline,
  TimelineItem,
} from '@growthtrace/design-system';
import { GitCommitHorizontal, GitPullRequest, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { sampleActivity, sampleTrend } from '../lib/sample-data';
import { primaryNav } from './nav';

/** Placeholder dashboard that exercises AppShell until real pages land. */
export default function HomePage() {
  return (
    <div className="relative isolate">
      <AuroraBackground />
      <AppShell
        brand="GrowthTrace"
        nav={primaryNav('/')}
        linkComponent={Link}
        actions={
          <>
            <SyncStatus state="synced" detail="2 min ago" />
            <Avatar name="Ada Lovelace" size="sm" />
          </>
        }
      >
        <div className="relative z-raised mx-auto flex max-w-page flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 text-text">Your growth this month</h1>
            <p className="text-body text-muted">
              Sample data. Real GitHub history arrives in a later phase.
            </p>
          </div>

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
        </div>
      </AppShell>
    </div>
  );
}
