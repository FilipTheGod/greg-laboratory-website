// next.config.js
/** @type {import('next').NextConfig} */
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "greglaboratory.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "www.greglaboratory.com",
        pathname: "**",
      },
    ],
  },
}

export default nextConfig
