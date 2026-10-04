import {
  ActivityHeatmap,
  AppShell,
  Avatar,
  Badge,
  Button,
  ChatBubble,
  cn,
  contrast,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Input,
  Panel,
  Skeleton,
  Spinner,
  StatTile,
  StreakMeter,
  type SyncState,
  SyncStatus,
  Timeline,
  TimelineItem,
  Tooltip,
  TooltipProvider,
} from '@growthtrace/design-system';
import { type ColorToken, tokens } from '@growthtrace/design-system/tokens';
import { GitCommitHorizontal, GitPullRequest } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { sampleActivity, sampleTrend } from '../../lib/sample-data';
import { primaryNav } from '../nav';
import { MotionDemo, ToastDemo } from './demos';

export const metadata: Metadata = { title: 'Aurora design system · GrowthTrace' };

/*
 * Literal class names per token. Tailwind only generates classes it can see in source,
 * and the Record types make this page fail typecheck when a token is added but not shown.
 */
const swatch: Record<ColorToken, string> = {
  bg: 'bg-bg',
  surface: 'bg-surface',
  'surface-raised': 'bg-surface-raised',
  border: 'bg-border',
  text: 'bg-text',
  'text-muted': 'bg-text-muted',
  'accent-from': 'bg-accent-from',
  'accent-to': 'bg-accent-to',
  'on-accent': 'bg-on-accent',
  success: 'bg-success',
  'success-subtle': 'bg-success-subtle',
  warning: 'bg-warning',
  'warning-subtle': 'bg-warning-subtle',
  danger: 'bg-danger',
  'danger-subtle': 'bg-danger-subtle',
  'on-danger': 'bg-on-danger',
  'accent-subtle': 'bg-accent-subtle',
  'aurora-1': 'bg-aurora-1',
  'aurora-2': 'bg-aurora-2',
  'aurora-3': 'bg-aurora-3',
  'aurora-4': 'bg-aurora-4',
  'heat-0': 'bg-heat-0',
  'heat-1': 'bg-heat-1',
  'heat-2': 'bg-heat-2',
  'heat-3': 'bg-heat-3',
  'heat-4': 'bg-heat-4',
};

const typeScale: Record<keyof typeof tokens.text, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  'body-lg': 'text-body-lg',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
};

const spacing: Record<keyof typeof tokens.spacing, string> = {
  0: 'w-0',
  1: 'w-1',
  2: 'w-2',
  3: 'w-3',
  4: 'w-4',
  6: 'w-6',
  8: 'w-8',
  10: 'w-10',
  12: 'w-12',
  16: 'w-16',
  20: 'w-20',
  24: 'w-24',
};

const radii: Record<keyof typeof tokens.radius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const fontWeights: Record<keyof typeof tokens.fontWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const opacities: Record<keyof typeof tokens.opacity, string> = {
  0: 'opacity-0',
  10: 'opacity-10',
  20: 'opacity-20',
  30: 'opacity-30',
  40: 'opacity-40',
  50: 'opacity-50',
  60: 'opacity-60',
  70: 'opacity-70',
  80: 'opacity-80',
  90: 'opacity-90',
  100: 'opacity-100',
};

/** Focus-ring demo wells: the ring must stay visible on every surface. */
const ringSurfaces = [
  { name: 'bg', className: 'bg-bg' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-raised', className: 'bg-surface-raised' },
] as const;

const shadows: Record<keyof typeof tokens.shadow, string> = {
  'glow-sm': 'shadow-glow-sm',
  'glow-md': 'shadow-glow-md',
  'glow-accent': 'shadow-glow-accent',
};

const syncStates: SyncState[] = ['idle', 'syncing', 'synced', 'error', 'offline'];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Panel asChild className="flex flex-col gap-4">
      <section aria-labelledby={id}>
        <h2 id={id} className="text-h2 text-text">
          {title}
        </h2>
        {children}
      </section>
    </Panel>
  );
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-h3 text-text">{title}</h3>
      {children}
    </div>
  );
}

/** Name/value rows for tokens that don't need a visual. */
function TokenTable({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {rows.map(([name, value]) => (
        <div key={name} className="flex min-w-0 flex-col">
          <dt className="font-mono text-body-sm text-text">{name}</dt>
          <dd className="font-mono text-caption break-words text-muted">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Living style guide: every Aurora token and component. Hidden in production. */
export default function DesignPage() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_ENABLE_DESIGN_ROUTE !== '1'
  ) {
    notFound();
  }

  return (
    <AppShell
      brand="GrowthTrace"
      nav={primaryNav('/design')}
      linkComponent={Link}
      actions={<SyncStatus state="synced" />}
    >
      <div className="mx-auto flex max-w-page flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-display text-text">Aurora</h1>
          <p className="max-w-prose text-body-lg text-muted">
            Every token and component in @growthtrace/design-system. If it isn&apos;t here, it
            isn&apos;t in the system: add it here first, then use it.
          </p>
        </div>

        <Section id="colour" title="Colour">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(tokens.color) as ColorToken[]).map((name) => (
              <li key={name} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn('size-12 shrink-0 rounded-md border border-border', swatch[name])}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="font-mono text-body-sm text-text">{name}</span>
                  <span className="font-mono text-caption text-muted">{tokens.color[name]}</span>
                  <span className="text-caption text-muted">
                    {contrast(name, 'bg').toFixed(2)}:1 on bg
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <TokenTable
            rows={Object.entries(tokens.textColor).map(([name, value]) => [`text-${name}`, value])}
          />
        </Section>

        <Section id="opacity" title="Opacity">
          <p className="text-body-sm text-muted">
            The only steps allowed for opacity-* and colour modifiers such as bg-surface/80.
          </p>
          <ul className="flex flex-wrap gap-4">
            {Object.entries(opacities).map(([name, cls]) => (
              <li key={name} className="flex flex-col items-center gap-2">
                <span aria-hidden className={cn('size-12 rounded-md bg-accent-gradient', cls)} />
                <span className="font-mono text-caption text-muted">{name}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="type" title="Typography">
          <div className="flex flex-col gap-4">
            {Object.entries(typeScale).map(([name, cls]) => {
              const t = tokens.text[name as keyof typeof tokens.text];
              return (
                <div key={name} className="flex flex-col gap-1">
                  <span className="font-mono text-caption text-muted">
                    {name} · {t.size} / {t.lineHeight} / {t.fontWeight}
                  </span>
                  <p className={cn('break-words text-text', cls)}>Evidence of growth</p>
                </div>
              );
            })}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {Object.entries(fontWeights).map(([name, cls]) => (
              <li key={name} className={cn('text-body-lg text-text', cls)}>
                {name} · {tokens.fontWeight[name as keyof typeof tokens.fontWeight]}
              </li>
            ))}
          </ul>
          <TokenTable rows={Object.entries(tokens.font)} />
        </Section>

        <Section id="spacing" title="Spacing">
          <ul className="flex flex-col gap-2">
            {Object.entries(spacing).map(([name, cls]) => (
              <li key={name} className="flex items-center gap-4">
                <span className="w-16 shrink-0 font-mono text-caption text-muted">
                  {name} · {tokens.spacing[Number(name) as keyof typeof tokens.spacing]}
                </span>
                <span aria-hidden className={cn('h-3 rounded-sm bg-accent-gradient', cls)} />
              </li>
            ))}
          </ul>
          <TokenTable rows={Object.entries(tokens.container)} />
          <TokenTable
            rows={Object.entries(tokens.safeArea).map(([name, value]) => [
              `safe-area-${name} (pb-safe)`,
              value,
            ])}
          />
        </Section>

        <Section id="radii" title="Radii">
          <ul className="flex flex-wrap gap-6">
            {Object.entries(radii).map(([name, cls]) => (
              <li key={name} className="flex flex-col items-center gap-2">
                <span
                  aria-hidden
                  className={cn('size-16 border border-border bg-surface-raised', cls)}
                />
                <span className="font-mono text-caption text-muted">{name}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="elevation" title="Elevation">
          <ul className="grid gap-6 sm:grid-cols-3">
            {Object.entries(shadows).map(([name, cls]) => (
              <li
                key={name}
                className={cn(
                  'rounded-lg border border-border bg-surface-raised p-6 font-mono text-body-sm text-text',
                  cls,
                )}
              >
                {name}
              </li>
            ))}
          </ul>
          <TokenTable rows={Object.entries(tokens.blur)} />
        </Section>

        <Section id="motion" title="Motion">
          <TokenTable
            rows={[
              ...Object.entries(tokens.duration),
              ...Object.entries(tokens.transitionDuration).map(
                ([name, value]): [string, string] => [`duration-${name} (class)`, value],
              ),
              ...Object.entries(tokens.ease),
              ...Object.entries(tokens.animate),
            ]}
          />
          <MotionDemo />
        </Section>

        <Section id="breakpoints" title="Breakpoints">
          <p className="text-body-sm text-text">
            Current:{' '}
            <span className="font-mono text-accent-from">
              <span className="xs:hidden">base</span>
              <span className="hidden xs:inline sm:hidden">xs</span>
              <span className="hidden sm:inline md:hidden">sm</span>
              <span className="hidden md:inline lg:hidden">md</span>
              <span className="hidden lg:inline xl:hidden">lg</span>
              <span className="hidden xl:inline 2xl:hidden">xl</span>
              <span className="hidden 2xl:inline">2xl</span>
            </span>
          </p>
          <TokenTable rows={Object.entries(tokens.breakpoint)} />
        </Section>

        <Section id="z" title="Z-index layers">
          <TokenTable
            rows={Object.entries(tokens.z).map(([name, value]) => [`z-${name}`, value])}
          />
        </Section>

        <Section id="primitives" title="Primitives">
          <Subsection title="Button">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
              <Button asChild variant="ghost">
                <Link href="/">As link</Link>
              </Button>
            </div>
          </Subsection>
          <Subsection title="Input">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Repository" placeholder="owner/name" />
              <Input label="Email" hint="We only use it for sync alerts." type="email" />
              <Input label="Token" error="This token has expired." defaultValue="ghp_..." />
              <Input label="Disabled" disabled defaultValue="Read only" />
            </div>
          </Subsection>
          <Subsection title="Badge">
            <div className="flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <Badge tone="accent">Accent</Badge>
            </div>
          </Subsection>
          <Subsection title="Avatar">
            <div className="flex items-center gap-3">
              <Avatar name="Ada Lovelace" size="sm" />
              <Avatar name="Grace Hopper" />
              <Avatar name="Linus" size="lg" />
              <Avatar name="Octo Cat" src="/avatar-sample.png" size="lg" />
            </div>
          </Subsection>
          <Subsection title="Skeleton and Spinner">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center gap-4 text-accent-from">
              <Spinner size="sm" />
              <Spinner />
              <Spinner size="lg" label="Loading activity" />
            </div>
          </Subsection>
          <Subsection title="Panel">
            <div className="grid gap-4 sm:grid-cols-3">
              <Panel>Surface</Panel>
              <Panel tone="raised">Raised</Panel>
              <Panel glow>Glow</Panel>
              <Panel padding="none">Padding none</Panel>
              <Panel padding="sm">Padding sm</Panel>
              <Panel padding="md">Padding md</Panel>
            </div>
          </Subsection>
          <Subsection title="Focus ring">
            <div className="grid gap-4 lg:grid-cols-3">
              {ringSurfaces.map(({ name, className }) => (
                <div
                  key={name}
                  data-surface={name}
                  className={cn('rounded-md border border-border p-6', className)}
                >
                  <Button variant="ghost" size="sm">
                    Focus ring on {name}
                  </Button>
                </div>
              ))}
            </div>
          </Subsection>
          <Subsection title="Tooltip, Dialog and Toast">
            <div className="flex flex-wrap items-center gap-3">
              <TooltipProvider>
                <Tooltip content="Last synced 2 minutes ago">
                  <Button variant="ghost" size="sm">
                    Hover or focus me
                  </Button>
                </Tooltip>
              </TooltipProvider>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Open dialog
                  </Button>
                </DialogTrigger>
                <DialogContent
                  title="Disconnect GitHub?"
                  description="Your synced history stays, but no new activity will be imported."
                >
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="danger" size="sm">
                        Disconnect
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <ToastDemo />
          </Subsection>
        </Section>

        <Section id="growthtrace" title="GrowthTrace components">
          <Subsection title="StatTile">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Commits" value={342} delta={12} trend={sampleTrend} />
              <StatTile label="Reviews" value={18} delta={-6} trend={[...sampleTrend].reverse()} />
              <StatTile label="Repos" value={7} />
            </div>
          </Subsection>
          <Subsection title="StreakMeter">
            <div className="grid gap-4 sm:grid-cols-2">
              <StreakMeter current={9} best={21} />
              <StreakMeter current={21} best={21} />
            </div>
          </Subsection>
          <Subsection title="TimelineItem">
            <Timeline>
              <TimelineItem
                icon={<GitPullRequest className="size-4" />}
                title="Merged #42 into main"
                timestamp="2 hours ago"
                dateTime="2026-09-30T10:00:00Z"
              >
                Repo tooling and CI.
              </TimelineItem>
              <TimelineItem
                icon={<GitCommitHorizontal className="size-4" />}
                title="12 commits to growth-trace"
                timestamp="Yesterday"
                dateTime="2026-09-29"
              />
            </Timeline>
          </Subsection>
          <Subsection title="ActivityHeatmap">
            <ActivityHeatmap days={sampleActivity(140)} label="Contributions, last 20 weeks" />
          </Subsection>
          <Subsection title="ChatBubble">
            <div className="flex flex-col gap-3">
              <ChatBubble from="user">How consistent was I in September?</ChatBubble>
              <ChatBubble from="assistant">
                You committed on 22 of 30 days, your best month this year.
              </ChatBubble>
              <ChatBubble from="assistant" streaming>
                Your longest streak started on
              </ChatBubble>
            </div>
          </Subsection>
          <Subsection title="SyncStatus">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {syncStates.map((state) => (
                <li key={state}>
                  <SyncStatus state={state} detail={state === 'synced' ? '2 min ago' : undefined} />
                </li>
              ))}
            </ul>
          </Subsection>
          <Subsection title="AppShell">
            <p className="text-body-sm text-muted">
              This page is rendered inside AppShell: a sidebar from md up, a bottom tab bar below
              md, and a skip link (press Tab on load).
            </p>
          </Subsection>
        </Section>
      </div>
    </AppShell>
  );
}
