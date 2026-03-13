/** @type {import('next').NextConfig} */

const isMobileBuild = process.env.MOBILE_BUILD === '1'

const nextConfig = {
  // Static export only for mobile builds (required for Capacitor)
  ...(isMobileBuild && {
    output: 'export',
    trailingSlash: true,
  }),

  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },

  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig
