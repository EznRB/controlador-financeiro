const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
  fallbacks: {},
  runtimeCaching: [
    {
      urlPattern: ({ request }) => ['style','script','image','font'].includes(request.destination),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'assets' }
    },
    // Não cachear APIs sensíveis
  ],
  exclude: [
    // add buildExcludes here
    ({ asset, compilation }) => {
      if (
        asset.name.startsWith('server/') ||
        asset.name.match(/^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/)
      ) {
        return true;
      }
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      return false;
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER || (process.env.SMTP_HOST ? 'email' : (process.env.ENABLE_DEV_LOGIN === 'true' ? 'credentials' : 'email')),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

// Cabeçalhos de segurança
nextConfig.headers = async () => {
  const isProd = process.env.NODE_ENV === 'production'
  const csp = isProd
    ? "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none';" +
      "img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" +
      "script-src 'self'; connect-src 'self' https://api.binance.com https://api.coingecko.com https://api.exchangerate.host"
    : "default-src 'self'; base-uri 'self'; object-src 'none';" +
      "img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' ws: http: https:; frame-ancestors 'self'";
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      ],
    },
  ]
}

module.exports = withPWA(nextConfig);
