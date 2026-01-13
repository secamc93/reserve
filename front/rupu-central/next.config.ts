import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Para Podman/Docker - genera una build optimizada
  
  // Configuraciones de Turbopack para Next.js 16
  turbopack: {
    // Configuración para evitar errores de archivos temporales
    resolveAlias: {
      // Evitar conflictos de cache
    }
  },
  
  // Configuraciones de webpack para desarrollo (solo si no usas Turbopack)
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
