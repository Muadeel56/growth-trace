import type { NextConfig } from 'next';

const config: NextConfig = {
  // The design system ships TypeScript source; Next compiles it like app code.
  transpilePackages: ['@growthtrace/design-system'],
};

export default config;
