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
export type { Resource, ResourcesList } from './resources/domain/entities';
export type { Permission, PermissionsList } from './permissions/domain/entities';

// Exportar UI común
export * from './ui';

// Exportar componentes UI desde los módulos migrados
export * from './users/ui';
export * from './businesses/ui';
export * from './resources/ui';
export * from './permissions/ui';
export * from './roles/ui';
export * from './business-types/ui';
export * from './login/ui';

// Exportar submódulos
export * from './resources';
export * from './permissions';

// NO exportar actions aquí - importarlas directamente donde se necesiten:
// import { loginAction } from '@modules/auth/infrastructure/actions';

