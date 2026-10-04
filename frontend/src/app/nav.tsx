import type { NavItem } from '@growthtrace/design-system';
import { ChartLine, GitPullRequest, House, MessageCircle, Palette } from 'lucide-react';

/** Primary navigation. `current` is the active href. */
export function primaryNav(current: string): NavItem[] {
  return [
    { href: '/', label: 'Dashboard', icon: <House className="size-full" /> },
    { href: '/#activity', label: 'Activity', icon: <ChartLine className="size-full" /> },
    { href: '/#timeline', label: 'Timeline', icon: <GitPullRequest className="size-full" /> },
    { href: '/#assistant', label: 'Assistant', icon: <MessageCircle className="size-full" /> },
    { href: '/design', label: 'Design', icon: <Palette className="size-full" /> },
  ].map((item) => ({ ...item, current: item.href === current }));
}
