/**
 * Barrel de infrastructure de Auth
 * Exporta solo lo necesario (normalmente nada, ya que es server-only)
 */

// Las actions se importan directamente desde su ubicación:
// import { loginAction } from '@modules/auth/infrastructure/actions';

// Los repositorios NO se exportan (son internos del módulo)

// Storage es exportable para uso en cliente
export * from './storage';
