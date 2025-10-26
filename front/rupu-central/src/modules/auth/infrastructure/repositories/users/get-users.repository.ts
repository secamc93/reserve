/**
 * Repositorio para Obtener Usuarios
 * Maneja la consulta de usuarios del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { GetUsersParams } from '../../../domain/ports/users/users.repository';
import { UsersList, UserListItem, UserRole, UserBusiness } from '../../../domain/entities/user-list.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendUsersListResponse } from '../response/users.response';

export class GetUsersRepository {
  async getUsers(params: GetUsersParams): Promise<UsersList> {
    const {
      page = 1,
      page_size = 10,
      name,
      email,
      phone,
      user_ids,
      is_active,
      role_id,
      business_id,
      sort_by,
      sort_order,
      token,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (phone) queryParams.append('phone', phone);
    if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) queryParams.append('user_ids', user_ids.join(','));
    if (is_active !== undefined) queryParams.append('is_active', is_active.toString());
    if (role_id) queryParams.append('role_id', role_id.toString());
    if (business_id) queryParams.append('business_id', business_id.toString());
    if (sort_by) queryParams.append('sort_by', sort_by);
    if (sort_order) queryParams.append('sort_order', sort_order);
    // Removed created_at_start and created_at_end as they don't exist in GetUsersParams
    if (sort_by) queryParams.append('sort_by', sort_by);
    if (sort_order) queryParams.append('sort_order', sort_order);

    const url = `${env.API_BASE_URL}/users?${queryParams.toString()}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'GET',
      url,
      token,
    });

    console.log('🔑 Token completo enviado:', token);

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
        throw new Error(errorData.message || `Error obteniendo usuarios: ${response.status}`);
      }

      const backendResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.count || 0} usuarios obtenidos`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // El backend devuelve data como array directamente, no como objeto con users
      const usersArray = Array.isArray(backendResponse.data) ? backendResponse.data : [];
      
      if (usersArray.length === 0) {
        console.log('No hay usuarios en la respuesta');
      }

      const users: UserListItem[] = usersArray.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar_url: user.avatar_url || undefined,
        is_active: user.is_active,
        last_login_at: user.last_login_at || undefined,
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
      }));

      // Calcular información de paginación basada en los parámetros de entrada
      const totalCount = backendResponse.count || users.length;
      const totalPages = Math.ceil(totalCount / page_size);

      return {
        users,
        count: totalCount,
        page: page,
        page_size: page_size,
        total_pages: totalPages,
      };
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener usuarios del servidor'
      );
    }
  }
}
