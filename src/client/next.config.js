/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: '../../.next',
  eslint: {
    dirs: ['src/client'],
  }
};

module.exports = nextConfig
