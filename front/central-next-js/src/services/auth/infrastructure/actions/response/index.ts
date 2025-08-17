/**
 * Exportaciones de todas las interfaces de response de autenticación
 */

// Interfaces para la respuesta del login (usuario, token, businesses)
export type {
  LoginUser,
  LoginBusinessType,
  LoginBusiness,
  LoginData,
  LoginResponse
} from './login';

// Interfaces para la respuesta de roles y permisos
export type {
  LoginAction,
  LoginResource,
  LoginRole,
  RolesPermissionsData,
  RolesPermissionsResponse
} from './roles-permissions'; 