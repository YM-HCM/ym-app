import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trailing slashes help iOS PWA scope matching
  // Without this, /home may be considered outside scope of /
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
