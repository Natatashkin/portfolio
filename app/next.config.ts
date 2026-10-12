import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    // Without the 2048 and 3840 steps: no image on the page renders wider than 960 CSS px.
    // 400 and 800 match the hero picture (400 CSS px max) at 1x and 2x.
    deviceSizes: [400, 640, 800, 1200, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }
    ]
  },
  sassOptions: {
    // Lets SCSS modules write `@use "mixins" as *;` instead of long relative paths.
    loadPaths: [path.join(process.cwd(), 'src/styles')]
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
