/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide the X-Powered-By header so we don't broadcast our framework.
  poweredByHeader: false,
  // When real avatar art lands and lives on Supabase Storage, we'll likely
  // switch from <img> to <Image> for optimization. The remote pattern below
  // allows any *.supabase.co host so that swap doesn't need another config
  // change. Other CDNs can be added here too.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
};

module.exports = nextConfig;
