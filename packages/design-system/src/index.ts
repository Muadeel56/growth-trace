/**
 * @growthtrace/design-system: Aurora tokens, motion presets and components.
 * Feature code arranges these; it never styles them.
 */
export { cn } from './lib/cn';
export { contrast } from './tokens/contrast';
export { focusRing } from './lib/focus';

export { AuroraMotionProvider } from './motion/AuroraMotionProvider';
export { countUp, fadeUp, glowHover, stagger, staggerItem } from './motion/presets';
export { useCountUp } from './motion/useCountUp';
/** Motion components, for arranging preset-driven animations (never inline objects). */
export { motion } from 'motion/react';

export { AuroraBackground } from './components/AuroraBackground';
export { Avatar, type AvatarProps, initials } from './components/Avatar';
export { Badge, type BadgeProps } from './components/Badge';
export { Button, type ButtonProps } from './components/Button';
export {
  Dialog,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogTrigger,
} from './components/Dialog';
export { Input, type InputProps } from './components/Input';
export { Panel, type PanelProps } from './components/Panel';
export { Skeleton } from './components/Skeleton';
export { Spinner, type SpinnerProps } from './components/Spinner';
export { type ToastOptions, ToastProvider, useToast } from './components/Toast';
export { Tooltip, type TooltipProps, TooltipProvider } from './components/Tooltip';

export {
  ActivityHeatmap,
  type ActivityHeatmapProps,
  type HeatmapDay,
} from './components/ActivityHeatmap';
export { AppShell, type AppShellProps, type NavItem } from './components/AppShell';
export { ChatBubble, type ChatBubbleProps } from './components/ChatBubble';
export { StatTile, type StatTileProps } from './components/StatTile';
export { StreakMeter, type StreakMeterProps } from './components/StreakMeter';
export { type SyncState, SyncStatus, type SyncStatusProps } from './components/SyncStatus';
export { Timeline, TimelineItem, type TimelineItemProps } from './components/TimelineItem';

export { Sparkline, type SparklineProps } from './charts/Sparkline';
export { chartColors, type ChartTone } from './charts/theme';
