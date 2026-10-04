import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  current?: boolean;
};

type LinkComponent = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

export type AppShellProps = {
  brand: ReactNode;
  nav: NavItem[];
  /** Header content on the right (sync status, avatar...). */
  actions?: ReactNode;
  /** Router link, e.g. next/link. Defaults to <a>. */
  linkComponent?: LinkComponent | 'a';
  children: ReactNode;
};

/**
 * App frame: sidebar nav from md up, bottom tab bar below md. Includes a skip link, the
 * z-nav layer and iOS safe-area padding under the tab bar.
 */
export function AppShell({
  brand,
  nav,
  actions,
  linkComponent: Link = 'a',
  children,
}: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh">
      <a
        href="#main-content"
        className={cn(
          'sr-only rounded-md bg-surface-raised px-4 py-2 text-body-sm text-text focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-tooltip',
          focusRing,
        )}
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary"
        data-nav="sidebar"
        className="sticky top-0 z-nav hidden h-dvh w-sidebar shrink-0 flex-col gap-6 border-r border-border bg-surface/80 p-4 backdrop-blur-md md:flex"
      >
        <div className="px-3 py-2 text-h3 text-text">{brand}</div>
        <ul className="flex flex-col gap-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-body-sm transition-colors duration-fast',
                  item.current
                    ? 'bg-surface-raised text-text'
                    : 'text-muted hover:bg-surface-raised hover:text-text',
                  focusRing,
                )}
              >
                <span aria-hidden className="flex size-4 items-center justify-center">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-raised flex items-center justify-between gap-4 border-b border-border bg-bg/70 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="text-h3 text-text md:invisible">{brand}</div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 pt-6 pb-24 outline-none md:px-8 md:pb-8"
        >
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary"
        data-nav="bottom"
        className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-surface/90 px-2 pt-2 pb-safe backdrop-blur-md md:hidden"
      >
        <ul className="flex justify-around">
          {nav.map((item) => (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md px-2 py-1 text-caption',
                  item.current ? 'text-accent-from' : 'text-muted hover:text-text',
                  focusRing,
                )}
              >
                <span aria-hidden className="flex size-6 items-center justify-center">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
