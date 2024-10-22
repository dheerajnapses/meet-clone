/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
  reactStrictMode: true,
  images: {
    domains: ['google-meet-two.vercel.app', 'localhost'],
  },
};

export default nextConfig;
