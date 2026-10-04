'use client';

import { X } from 'lucide-react';
import { Dialog as RadixDialog } from 'radix-ui';
import type { ReactNode } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';

/** Radix Dialog: focus trap, Esc to close, scroll lock. */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export type DialogContentProps = {
  /** Required: labels the dialog for assistive tech. */
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function DialogContent({ title, description, children, className }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-overlay bg-bg/70 backdrop-blur-sm" />
      <RadixDialog.Content
        // Without a description, tell Radix there is deliberately nothing to describe.
        {...(description ? {} : { 'aria-describedby': undefined })}
        className={cn(
          'fixed inset-x-4 top-1/2 z-dialog mx-auto max-w-md -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-glow-md',
          focusRing,
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <RadixDialog.Title className="text-h3 text-text">{title}</RadixDialog.Title>
          <RadixDialog.Close
            aria-label="Close"
            className={cn('rounded-sm p-1 text-muted hover:text-text', focusRing)}
          >
            <X aria-hidden className="size-4" />
          </RadixDialog.Close>
        </div>
        {description && (
          <RadixDialog.Description className="mt-2 text-body-sm text-muted">
            {description}
          </RadixDialog.Description>
        )}
        {children && <div className="mt-4">{children}</div>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
