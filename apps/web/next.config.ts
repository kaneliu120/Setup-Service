import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://ssv2-api.azurewebsites.net/:path*' 
          : 'http://localhost:3001/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
