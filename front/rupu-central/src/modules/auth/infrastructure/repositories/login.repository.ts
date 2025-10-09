/**
 * Repositorio de Login
 * Maneja la autenticación de usuarios
 * IMPORTANTE: Este archivo es server-only
 */

import { ILoginRepository } from '../../domain/ports/login.repository';
import { User, LoginResponse } from '../../domain/entities/user.entity';
import { env } from '@shared/config/env';
import { BackendLoginResponse, Business } from './response';

export class LoginRepository implements ILoginRepository {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Llamada al backend para login
      const response = await fetch(`${env.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error en login: ${response.status}`);
      }

      // Parsear respuesta tipada del backend
      const backendResponse: BackendLoginResponse = await response.json();
      
      // Validar que la respuesta tenga la estructura esperada
      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { user: backendUser, token, businesses } = backendResponse.data;

      // Mapear el usuario del backend a nuestra entidad User
      const user: User = {
        id: String(backendUser.id),
        email: backendUser.email,
        name: backendUser.name,
        role: this.mapBackendRoleToAppRole(businesses),
        avatarUrl: backendUser.avatar_url || undefined,
        createdAt: new Date(), // El backend no envía estos campos
        updatedAt: new Date(backendUser.last_login_at),
      };

      // Mapear los businesses a un formato simplificado (incluyendo colores)
      const mappedBusinesses = businesses.map(b => ({
        id: b.id,
        name: b.name,
        code: b.code,
        logo_url: b.logo_url,
        is_active: b.is_active,
        primary_color: b.primary_color,
        secondary_color: b.secondary_color,
        tertiary_color: b.tertiary_color,
        quaternary_color: b.quaternary_color,
      }));

      return {
        user,
        token,
        businesses: mappedBusinesses,
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al conectar con el servidor'
      );
    }
  }

  /**
   * Mapea los negocios del backend a un rol de la aplicación
   * TODO: En el futuro, el rol debería venir directamente del backend
   */
  private mapBackendRoleToAppRole(businesses: Business[]): string {
    // Por ahora, asignamos un rol básico según los negocios
    // Esto será reemplazado por el rol que envíe el backend
    if (businesses && businesses.length > 0 && businesses.some(b => b.is_active)) {
      return 'ADMIN';
    }
    return 'USER';
  }
}

