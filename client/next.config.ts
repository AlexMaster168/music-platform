import type { NextConfig } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const apiHost = new URL(apiUrl);

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: apiHost.protocol.replace(':', '') as 'http' | 'https',
            hostname: apiHost.hostname,
            port: apiHost.port || undefined,
            pathname: '/**',
         },
      ],
   },
};

export default nextConfig;
