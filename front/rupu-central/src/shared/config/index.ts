/**
 * Barrel de configuración compartida
 */

export * from './env';
export { TokenStorage } from '../../services/auth/infrastructure/storage/token.storage';
export type { BusinessColors, BusinessData } from '../../services/auth/infrastructure/storage/token.storage';
export * from '../utils';

