import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["three", "@react-three/drei", "gsap", "lenis"],
  },
  transpilePackages: ["three"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
