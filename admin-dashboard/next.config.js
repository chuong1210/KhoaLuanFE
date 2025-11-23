/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '0.0.0.0',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/products/:path*',
        destination: 'http://localhost:9001/v1/product/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'http://localhost:9002/v1/orders/:path*',
      },
      {
        source: '/api/vouchers/:path*',
        destination: 'http://localhost:9002/v1/vouchers/:path*',
      },
      {
        source: '/api/shops/:path*',
        destination: 'http://localhost:8000/api/Shops/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:9004/v1/platform/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:7071/identity/auth/:path*',
      },
    ]
  },
}

module.exports = nextConfig
