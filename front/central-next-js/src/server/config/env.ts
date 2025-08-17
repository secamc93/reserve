// Configuración de variables de entorno del servidor
// Estas variables NO se exponen al cliente

export const serverConfig = {
  // API Base URL - Prioridad: .env.local > Docker > localhost
  API_BASE_URL: process.env.API_BASE_URL || 
                 (process.env.NODE_ENV === 'production' ? 'http://central_reserve:3050' : 'http://localhost:3050'),
  
  // Configuración de JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  
  // Configuración de base de datos
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME || 'reserve_dev',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  
  // Configuración de la aplicación
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // URLs de redirección
  LOGIN_REDIRECT_URL: process.env.LOGIN_REDIRECT_URL || '/calendar',
  LOGOUT_REDIRECT_URL: process.env.LOGOUT_REDIRECT_URL || '/auth/login',
};

// Función para obtener la URL base de la API
export function getApiBaseUrl(): string {
  // En desarrollo local, usar localhost
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://localhost:3050';
  }
  
  // En producción o Docker, usar la variable de entorno
  return serverConfig.API_BASE_URL;
}

// Función para verificar si estamos en desarrollo local
export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && 
         !process.env.DOCKER_ENV && 
         typeof window === 'undefined';
} 