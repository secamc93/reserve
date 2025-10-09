/**
 * Barrel de configuración compartida
 */

export * from './env';
export { TokenStorage } from '../../modules/auth/infrastructure/storage/token.storage';
export type { BusinessColors, BusinessData } from '../../modules/auth/infrastructure/storage/token.storage';
export * from '../utils';

