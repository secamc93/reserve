/**
 * Repositorio de Usuarios - Actualizar Usuario
 * Maneja la actualización de usuarios del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { UpdateUserParams, UpdateUserResponse } from '../../../domain/entities/update-user.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendUpdateUserResponse } from '../response/users.response';

export class UpdateUserRepository {
  async updateUser(params: UpdateUserParams): Promise<UpdateUserResponse> {
    const { id, token, name, email, phone, avatarFile, is_active, role_ids, business_ids } = params;

    // Preparar FormData para el envío (soporta archivos)
    const formData = new FormData();
    
    if (name !== undefined) formData.append('name', name);
    if (email !== undefined) formData.append('email', email);
    if (phone !== undefined) formData.append('phone', phone);
    if (is_active !== undefined) formData.append('is_active', is_active.toString());
    if (role_ids !== undefined) formData.append('role_ids', role_ids);
    if (business_ids !== undefined) formData.append('business_ids', business_ids);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const url = `${env.API_BASE_URL}/users/${id}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'PUT',
      url,
      token,
    });

    try {
      const response = await fetch(url, {
        method: 'PUT',
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
        throw new Error(errorData.message || `Error actualizando usuario: ${response.status}`);
      }

      const backendResponse: BackendUpdateUserResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Usuario ${backendResponse.data.name} actualizado exitosamente`,
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
        avatar_url: user.avatar_url || undefined,
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
      console.error('Error actualizando usuario:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar usuario en el servidor'
      );
    }
  }
}

