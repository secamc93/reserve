// Configuration - Environment Variables
export const config = {
  // API Base URL - Next.js usa NEXT_PUBLIC_
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3050',
  
  // Otras configuraciones
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Rupü',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Configuración de entorno
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // URL base de la aplicación
  APP_BASE_PATH: process.env.NEXT_PUBLIC_APP_BASE_PATH || '/app',
};

// Función para validar configuración
export const validateConfig = () => {
  console.log('🔧 Configuración cargada:', {
    API_BASE_URL: config.API_BASE_URL,
    APP_NAME: config.APP_NAME,
    APP_BASE_PATH: config.APP_BASE_PATH,
    MODE: process.env.NODE_ENV,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction
  });
  
  return config;
};

// Validar configuración al cargar
validateConfig(); 