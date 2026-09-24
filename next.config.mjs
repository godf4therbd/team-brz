/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Deliberately empty: every next/image usage today points at a local
    // /public path. Don't add a wildcard/broad remotePattern here — if a
    // feature (e.g. avatar upload) ever needs a remote image host, list
    // that exact host explicitly so next/image (and Vercel's image
    // optimizer) can't be pointed at an arbitrary attacker-supplied URL.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
