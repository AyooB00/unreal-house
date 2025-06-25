/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // For Cloudflare Pages deployment
  output: 'export',
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    // When deployed on same domain, use relative paths
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || '',
  },
  
  // Trailing slashes for better static hosting
  trailingSlash: true,
}

export default nextConfig