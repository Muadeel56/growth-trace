import type { NextConfig } from 'next';

const config: NextConfig = {
  // The design system ships TypeScript source; Next compiles it like app code.
  transpilePackages: ['@growthtrace/design-system'],
  // The dev badge would show up in screenshots and count as a tap target in e2e checks.
  devIndicators: false,
  // Playwright runs its own dev server with a separate build dir: Next 16 locks the dist
  // dir, so this lets the e2e check run while `npm run dev` is up.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default config;
