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
    const { name, email, phone, role, avatarFile, business_ids, token } = params;

    // Preparar FormData para el envío
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('business_ids', business_ids);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

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
        throw new Error(errorData.message || `Error creando usuario: ${response.status}`);
      }

      const backendResponse: BackendCreateUserResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Usuario ${backendResponse.data.name} creado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const user = backendResponse.data;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar_url: user.avatar_url || null,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        roles: user.roles.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          level: role.level,
          is_system: role.is_system,
          scope_id: role.scope_id,
        })),
        businesses: user.businesses.map((business: any) => ({
          id: business.id,
          name: business.name,
          logo_url: business.logo_url,
          business_type_id: business.business_type_id,
          business_type_name: business.business_type_name,
        })),
      };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear usuario en el servidor'
      );
    }
  }
}
