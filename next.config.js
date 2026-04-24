/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Request timeout configuration (30 seconds)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  async headers() {
    const securityHeaders = [
      // HSTS (HTTP Strict Transport Security)
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
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
      // Content Security Policy
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
          "img-src 'self' data: https://*.supabase.co https://*.tile.openstreetmap.org https://*.openstreetmap.org blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co",
          "frame-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      // CORS Policy
      {
        key: 'Access-Control-Allow-Origin',
        value: process.env.NODE_ENV === 'production' 
          ? (process.env.ALLOWED_ORIGIN || 'https://yourdomain.com') 
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
