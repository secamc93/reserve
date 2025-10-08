/**
 * Barrel principal del módulo Auth
 * Exporta solo lo "público" del módulo
 * 
 * IMPORTANTE:
 * - Las actions NO se exportan aquí (son server-only)
 * - Las actions se importan directamente en Server Components/Route Handlers
 * - La UI se puede usar en cualquier componente
 * - Domain/Application solo si otros módulos necesitan los tipos
 */

// Exportar tipos del dominio (pueden ser útiles en otros módulos)
export type { User, CreateUserDTO, UpdateUserDTO } from './domain/entities/user.entity';

// Exportar componentes UI
export * from './ui';

// NO exportar actions aquí - importarlas directamente donde se necesiten:
// import { loginAction } from '@modules/auth/infrastructure/actions';

