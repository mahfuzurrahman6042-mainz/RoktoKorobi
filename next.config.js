/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Request timeout configuration (30 seconds)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
    optimizePackageImports: ['@supabase/supabase-js', 'leaflet', 'react-leaflet'],
  },
  
  // Turbopack configuration
  turbopack: {},
  
  // Disable static generation for API routes that need runtime env vars
  output: 'standalone',
  
  // Bundle optimization - simplified for Turbopack compatibility
  webpack: (config, { isServer, dev }) => {
    // Only apply webpack optimizations in production
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
      
      // Reduce bundle size in production
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['*.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Compression
  compress: true,
  
  // SWC minification
  swcMinify: true,
  
  async headers() {
    const securityHeaders = [
      // HSTS (HTTP Strict Transport Security) - fixed for GitHub
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
      // Prevent clickjacking
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      // Prevent MIME type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // XSS Protection
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      // Referrer Policy
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Permissions Policy
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      // Content Security Policy - fixed for GitHub
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
          "img-src 'self' data: https://*.supabase.co https://*.tile.openstreetmap.org https://*.openstreetmap.org blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co https://*.vercel.app",
          "frame-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      // CORS Policy - fixed for Vercel
      {
        key: 'Access-Control-Allow-Origin',
        value: process.env.NODE_ENV === 'production' 
          ? 'https://red-reach-v22-fixed.vercel.app' 
          : '*',
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS',
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization, x-csrf-token',
      },
      {
        key: 'Access-Control-Allow-Credentials',
        value: 'true',
      },
      {
        key: 'Access-Control-Max-Age',
        value: '86400', // 24 hours
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
