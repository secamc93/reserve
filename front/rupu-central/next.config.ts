import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Para Docker - genera una build optimizada
};

export default nextConfig;
