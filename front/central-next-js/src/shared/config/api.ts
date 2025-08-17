// Configuración de API compartida

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  VERSION: 'v1',
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    BUSINESSES: '/businesses',
    CLIENTS: '/clients',
    RESERVATIONS: '/reservations',
    TABLES: '/tables',
    ROOMS: '/rooms',
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intenta nuevamente.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor. Intenta más tarde.',
} as const; 