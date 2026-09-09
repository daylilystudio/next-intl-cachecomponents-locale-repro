import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // The mismatch only shows up with Cache Components enabled.
  cacheComponents: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
