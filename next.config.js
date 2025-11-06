/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for mobile apps (required for Capacitor)
  output: 'export',
  
  images: {
    // Disable image optimization for static export
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  // Trailing slash for better compatibility
  trailingSlash: true,
  
  // Disable features that don't work with static export
  // Note: API routes and server components won't work
}

module.exports = nextConfig

