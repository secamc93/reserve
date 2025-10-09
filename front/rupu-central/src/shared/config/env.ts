/**
 * Configuración de variables de entorno
 * IMPORTANTE: Sin valores por defecto
 * Si falta alguna variable requerida, la aplicación lanzará un error
 */

/**
 * Obtiene una variable de entorno requerida
 * Lanza error si no existe
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Variable de entorno requerida no encontrada: ${key}\n` +
      `Por favor, configúrala en tu archivo .env.local`
    );
  }
  return value;
}

/**
 * Variables de entorno del proyecto
 */
export const env = {
  // API Backend (privada - solo servidor)
  // REQUERIDA para hacer peticiones al backend
  get API_BASE_URL(): string {
    return getRequiredEnv('API_BASE_URL');
  },
} as const;

