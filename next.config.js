/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Increase body size limit for PDF uploads (default is 4.5MB)
  // Vercel allows up to 4.5MB for Hobby plan, 100MB for Pro
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
