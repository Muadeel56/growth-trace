import { cn } from '../lib/cn';

/** Delay each layer by a fraction of the ambient cycle so they drift out of phase. */
const phase = (fraction: number) => ({
  animationDelay: `calc(var(--duration-ambient) * ${-fraction})`,
});

/**
 * Ambient aurora: four blurred colour fields that drift slowly. Static when reduced
 * motion is on. Place inside a `relative isolate` parent and give the content `relative z-raised`.
 * (On the style allowlist for the per-layer animation phase.)
 */
export function AuroraBackground({ className }: { className?: string }) {
  const layer =
    'absolute size-1/2 rounded-full opacity-40 blur-aurora motion-ok:animate-aurora-drift';
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 z-base overflow-hidden', className)}
    >
      <div className={cn(layer, 'top-0 left-0 bg-aurora-1')} />
      <div className={cn(layer, 'top-1/4 right-0 bg-aurora-2')} style={phase(0.25)} />
      <div className={cn(layer, 'bottom-0 left-1/4 bg-aurora-3')} style={phase(0.5)} />
      <div className={cn(layer, 'right-1/4 bottom-1/4 bg-aurora-4')} style={phase(0.75)} />
    </div>
  );
}
