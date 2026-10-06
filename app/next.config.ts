import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  sassOptions: {
    // Lets SCSS modules write `@use "mixins" as *;` instead of long relative paths.
    loadPaths: [path.join(process.cwd(), 'src/styles')]
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
