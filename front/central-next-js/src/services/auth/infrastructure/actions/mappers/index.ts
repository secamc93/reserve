/**
 * Exportaciones de todos los mappers de autenticación
 */

// Mapper para la respuesta del login (usuario, token, businesses)
export { mapLoginResponseToDomain } from './login-response.mapper';

// Mapper para roles y permisos
export { mapRolesPermissionsResponseToDomain } from './roles-permissions.mapper';

// Mappers para credenciales de login
export {
  mapLoginRequestToLoginCredentials,
  mapFormDataToLoginCredentials
} from './auth.mapper';

// Tipos para la respuesta del backend
export type { LoginData } from '../response/login';
export type { RolesPermissionsData } from '../response/roles-permissions';

