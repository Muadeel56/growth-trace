'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar as RadixAvatar } from 'radix-ui';

import { cn } from '../lib/cn';

const avatar = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised font-semibold text-text',
  {
    variants: {
      size: { sm: 'size-8 text-caption', md: 'size-10 text-body-sm', lg: 'size-12 text-body' },
    },
    defaultVariants: { size: 'md' },
  },
);

/** "Ada Lovelace" -> "AL". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export type AvatarProps = VariantProps<typeof avatar> & {
  name: string;
  src?: string;
  className?: string;
};

export function Avatar({ name, src, size, className }: AvatarProps) {
  return (
    <RadixAvatar.Root className={cn(avatar({ size }), className)}>
      {src && <RadixAvatar.Image src={src} alt={name} className="size-full object-cover" />}
      <RadixAvatar.Fallback aria-label={name} delayMs={src ? 300 : 0}>
        {initials(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
