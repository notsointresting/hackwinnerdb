import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project thumbnails are hosted wherever the original submission lives, so the
    // host set is open-ended. Data is reviewed in a pull request before it can land.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
