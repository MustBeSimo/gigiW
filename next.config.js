/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    staticImageExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'ico'],
  },
}

module.exports = nextConfig