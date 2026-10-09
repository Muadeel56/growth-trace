import { AppShell, AuroraBackground, Avatar, SyncStatus } from '@growthtrace/design-system';
import Link from 'next/link';

import { DashboardContent, type DashboardState, dashboardSync } from './dashboard';
import { primaryNav } from './nav';

/** Sample data only, so the dashboard is always ready. Every other state is on /design. */
const state: DashboardState = 'ready';

/** Dashboard shell, built only from Aurora tokens and components. */
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
            <SyncStatus {...dashboardSync[state]} />
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
          <DashboardContent state={state} />
        </div>
      </AppShell>
    </div>
  );
}
