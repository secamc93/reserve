/**
 * Mappers para entidades de autenticación
 * Convierte entre diferentes formatos de datos de autenticación
 */

import type { LoginCredentials } from '../../../domain/entities/Auth';
import type { LoginRequest } from '../request/login';

/**
 * Convierte LoginRequest (infraestructura) a LoginCredentials (dominio)
 * @param loginRequest - Datos de login desde la infraestructura
 * @returns LoginCredentials en formato del dominio
 */
export function mapLoginRequestToLoginCredentials(loginRequest: LoginRequest): LoginCredentials {
  return {
    email: loginRequest.email,
    password: loginRequest.password
  };
}

/**
 * Convierte LoginCredentials (dominio) a LoginRequest (infraestructura)
 * @param loginCredentials - Credenciales del dominio
 * @returns LoginRequest en formato de infraestructura
 */
export function mapLoginCredentialsToLoginRequest(loginCredentials: LoginCredentials): LoginRequest {
  return {
    email: loginCredentials.email,
    password: loginCredentials.password
  };
}

/**
 * Convierte FormData a LoginCredentials (dominio)
 * @param formData - FormData del formulario de login
 * @returns LoginCredentials en formato del dominio
 */
export function mapFormDataToLoginCredentials(formData: FormData): LoginCredentials {
  return {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  };
}

/**
 * Convierte FormData a LoginRequest (infraestructura)
 * @param formData - FormData del formulario de login
 * @returns LoginRequest en formato de infraestructura
 */
export function mapFormDataToLoginRequest(formData: FormData): LoginRequest {
  return {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  };
} 