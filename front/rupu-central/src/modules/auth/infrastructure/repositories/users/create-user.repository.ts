/**
 * Repositorio para Crear Usuario
 * Maneja la creación de usuarios del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { CreateUserParams } from '../../../domain/entities/create-user.entity';
import { CreateUserResponse } from '../../../domain/entities/create-user.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendCreateUserResponse } from '../response/users.response';

export class CreateUserRepository {
  async createUser(params: CreateUserParams): Promise<CreateUserResponse> {
    const { name, email, phone, is_active, avatarFile, business_ids, token } = params;

    // Preparar FormData para el envío (multipart/form-data)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (typeof is_active === 'boolean') formData.append('is_active', String(is_active));
    if (avatarFile) formData.append('avatarFile', avatarFile);
    if (business_ids) formData.append('business_ids', business_ids);

    const url = `${env.API_BASE_URL}/users`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'POST',
      url,
      token,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || errorData.error || `Error creando usuario: ${response.status}`);
      }

      const backendResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: backendResponse.message || `Usuario creado`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Respuesta inválida del servidor');
      }

      // El backend retorna { success, email, password, message }
      return {
        success: backendResponse.success,
        email: backendResponse.email,
        password: backendResponse.password,
        message: backendResponse.message,
      } as CreateUserResponse;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear usuario en el servidor'
      );
    }
  }
}
