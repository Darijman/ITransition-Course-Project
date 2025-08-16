import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'res.cloudinary.com'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
