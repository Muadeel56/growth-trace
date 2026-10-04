'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Toast as RadixToast } from 'radix-ui';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focus';

const toastStyle = cva(
  'flex items-start gap-3 rounded-md border bg-surface-raised p-4 text-text shadow-glow-md',
  {
    variants: {
      tone: {
        neutral: 'border-border',
        success: 'border-success',
        danger: 'border-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type ToastOptions = VariantProps<typeof toastStyle> & {
  title: string;
  description?: string;
};

type ToastEntry = ToastOptions & { id: number };

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

/** Mount once near the root. Renders the toast viewport. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    setToasts((list) => [...list, { ...options, id: Date.now() + Math.random() }]);
  }, []);

  const dismiss = (id: number) => setToasts((list) => list.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map(({ id, title, description, tone }) => (
          <RadixToast.Root
            key={id}
            onOpenChange={(open) => !open && dismiss(id)}
            className={cn(toastStyle({ tone }), focusRing)}
          >
            <div className="flex-1">
              <RadixToast.Title className="text-body-sm font-semibold">{title}</RadixToast.Title>
              {description && (
                <RadixToast.Description className="text-body-sm text-muted">
                  {description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              aria-label="Dismiss"
              className={cn('rounded-sm p-1 text-muted hover:text-text', focusRing)}
            >
              <X aria-hidden className="size-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed inset-x-4 bottom-24 z-toast flex flex-col gap-2 md:right-4 md:bottom-4 md:left-auto md:w-full md:max-w-md" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

/** `const toast = useToast(); toast({ title: 'Synced' })`. Needs a ToastProvider above. */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used inside <ToastProvider>');
  return toast;
}
