/**
 * Configuración de variables de entorno
 * Centraliza y valida todas las env vars del proyecto
 */

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Auth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  
  // API
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

// Validación de env vars requeridas en runtime
export function validateEnv() {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'] as const;
  const missing = required.filter((key) => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }
}

