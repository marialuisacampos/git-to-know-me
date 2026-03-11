import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "gittoknowme.com" }],
        destination: "https://www.gittoknowme.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
