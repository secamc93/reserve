// Configuration - Environment Variables
export const config = {
  // API Base URL - CRA usa REACT_APP_
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  
  // Otras configuraciones
  APP_NAME: process.env.REACT_APP_NAME || 'Reserve App',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Configuración de entorno
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Función para validar configuración
export const validateConfig = () => {
  if (!config.API_BASE_URL) {
    console.error('❌ REACT_APP_API_BASE_URL no está definida');
    throw new Error('REACT_APP_API_BASE_URL es requerida');
  }
  
  console.log('🔧 Configuración cargada:', {
    API_BASE_URL: config.API_BASE_URL,
    APP_NAME: config.APP_NAME,
    MODE: process.env.NODE_ENV,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction
  });
  
  return config;
};

// Validar configuración al cargar
validateConfig(); 