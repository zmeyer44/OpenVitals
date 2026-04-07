import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@openvitals/common",
    "@openvitals/database",
    "@openvitals/blob-storage",
    "@openvitals/ai",
    "@openvitals/events",
    "@openvitals/sharing",
  ],
};

export default nextConfig;
