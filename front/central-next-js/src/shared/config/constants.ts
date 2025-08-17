// Constantes compartidas de la aplicación

export const APP_CONSTANTS = {
  APP_NAME: 'Rupü',
  APP_VERSION: '1.0.0',
  DEFAULT_LOCALE: 'es-ES',
  DEFAULT_TIMEZONE: 'America/Argentina/Buenos_Aires',
} as const;

export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const; 