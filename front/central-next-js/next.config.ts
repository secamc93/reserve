/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar el path base para la aplicación
  basePath: '/app',
  
  // Configuraciones para producción
  output: 'standalone',
  poweredByHeader: false,
  
  // Habilitar Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8080', 'central_reserve:3050'],
    },
  },
  
  // Configuración de imágenes
  images: {
    domains: ['www.xn--rup-joa.com', 'media.xn--rup-joa.com'],
    unoptimized: true,
  },
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ];
  },
  
  // Configuración de webpack para optimizaciones
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Optimizaciones para el servidor
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    
    return config;
  },
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Configuración de tipos
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
