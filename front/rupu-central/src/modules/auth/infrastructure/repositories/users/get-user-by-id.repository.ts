/**
 * Repositorio de Usuarios - Obtener Usuario por ID
 * Maneja la consulta de un usuario específico por su ID
 * IMPORTANTE: Este archivo es server-only
 */

import { GetUserByIdParams, GetUserByIdResponse } from '../../../domain/entities/get-user-by-id.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendGetUserByIdResponse } from '../response/users.response';

export class GetUserByIdRepository {
  async getUserById(params: GetUserByIdParams): Promise<GetUserByIdResponse> {
    const { id, token } = params;

    const url = `${env.API_BASE_URL}/users/${id}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'GET',
      url,
      token,
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        throw new Error(errorData.message || `Error obteniendo usuario: ${response.status}`);
      }

      const backendResponse: BackendGetUserByIdResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Usuario ${backendResponse.data.name} obtenido exitosamente`,
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
        phone: user.phone || null,
        avatar_url: user.avatar_url || null,
        is_active: user.is_active,
        is_super_user: user.is_super_admin,
        last_login_at: user.last_login_at || null,
        created_at: user.created_at,
        updated_at: user.updated_at,
        roles: (user.roles || []).map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          level: role.level,
          is_system: role.is_system,
          scope_id: role.scope_id,
        })),
        businesses: (user.businesses || []).map((business: any) => ({
          id: business.id,
          name: business.name,
          logo_url: business.logo_url,
          business_type_id: business.business_type_id,
          business_type_name: business.business_type_name,
        })),
        business_role_assignments: (user.business_role_assignments || []).map((bra: any) => ({
          business_id: bra.business_id,
          business_name: bra.business_name,
          role_id: bra.role_id,
          role_name: bra.role_name,
        })),
      };
    } catch (error) {
      console.error('Error obteniendo usuario por ID:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener usuario del servidor'
      );
    }
  }
}

