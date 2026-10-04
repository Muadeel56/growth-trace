import '@growthtrace/design-system/styles.css';

import { AuroraMotionProvider, ToastProvider } from '@growthtrace/design-system';
import { tokens } from '@growthtrace/design-system/tokens';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'GrowthTrace',
  description: 'Your GitHub history as an evidence-based growth dashboard.',
};

export const viewport: Viewport = {
  themeColor: tokens.color.bg,
  // Lets the bottom tab bar extend under the iOS home indicator (it pads itself).
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuroraMotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuroraMotionProvider>
      </body>
    </html>
  );
}
