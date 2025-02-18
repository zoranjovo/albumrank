import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/image/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;

// Assuming spotify does not update their image CDN this should not need to be changed