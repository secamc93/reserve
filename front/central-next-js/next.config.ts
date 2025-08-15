/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar el path base para la aplicación
  basePath: '/app',
  
  // Configuraciones para producción
  output: 'standalone',
  poweredByHeader: false,
  
  // Configuración de imágenes
  images: {
    domains: ['www.xn--rup-joa.com', 'media.xn--rup-joa.com'],
    unoptimized: true
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
          }
        ]
      }
    ];
  }
};

export default nextConfig;
