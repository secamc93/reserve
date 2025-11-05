import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Para Docker - genera una build optimizada
  
  // Configuración de ESLint para permitir build con warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuraciones para prevenir errores de cache
  experimental: {
    // Mejorar estabilidad del desarrollo
    turbo: {
      // Configuración para evitar errores de archivos temporales
      resolveAlias: {
        // Evitar conflictos de cache
      }
    }
  },
  
  // Configuraciones de webpack para desarrollo
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Configuraciones específicas para desarrollo
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
