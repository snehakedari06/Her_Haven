import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ['her-haven.s3.us-east-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'her-haven.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
