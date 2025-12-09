/**
 * Repositorio de Login
 * Maneja la autenticación de usuarios
 * IMPORTANTE: Este archivo es server-only
 */

import { ILoginRepository } from '../../domain/ports';
import { LoginRequest, LoginResponse } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendLoginResponse, BackendLoginErrorResponse } from './response';

export class LoginRepository implements ILoginRepository {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const url = `${env.API_BASE_URL}/auth/login`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'POST',
      url,
      body: { email: request.email, password: '***' },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
          password: request.password,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = `Error en login: ${response.status}`;
        
        try {
          const errorData: BackendLoginErrorResponse = await response.json();
          errorMessage = errorData.error || errorMessage;
          
          logHttpError({
            method: 'POST',
            url,
            status: response.status,
            error: errorMessage,
            responseTime,
          });
        } catch {
          logHttpError({
            method: 'POST',
            url,
            status: response.status,
            error: errorMessage,
            responseTime,
          });
        }

        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      const backendResponse: BackendLoginResponse = await response.json();

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { user, token, businesses, scope, is_super_admin, require_password_change } = backendResponse.data;

      // Mapear respuesta del backend a entidad de dominio
      const loginResponse: LoginResponse = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url,
          is_active: user.is_active,
          last_login_at: user.last_login_at,
        },
        token,
        require_password_change,
        businesses: businesses.map(b => ({
          id: b.id,
          name: b.name,
          code: b.code,
          business_type_id: b.business_type_id,
          business_type: {
            id: b.business_type.id,
            name: b.business_type.name,
            code: b.business_type.code,
            description: b.business_type.description,
            icon: b.business_type.icon,
          },
          timezone: b.timezone,
          address: b.address,
          description: b.description,
          logo_url: b.logo_url,
          primary_color: b.primary_color,
          secondary_color: b.secondary_color,
          tertiary_color: b.tertiary_color,
          quaternary_color: b.quaternary_color,
          navbar_image_url: b.navbar_image_url,
          custom_domain: b.custom_domain,
          is_active: b.is_active,
          enable_delivery: b.enable_delivery,
          enable_pickup: b.enable_pickup,
          enable_reservations: b.enable_reservations,
        })),
        scope,
        is_super_admin,
      };

      logHttpSuccess({
        method: 'POST',
        url,
        status: response.status,
        responseTime,
      });

      console.log('🔐 LoginRepository - Login exitoso:', {
        userId: loginResponse.user.id,
        email: loginResponse.user.email,
        scope,
        isSuperAdmin: is_super_admin,
        businessesCount: businesses.length,
      });

      return loginResponse;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logHttpError({
        method: 'POST',
        url,
        status: 0,
        error: error instanceof Error ? error.message : 'Error desconocido',
        responseTime,
      });

      throw error;
    }
  }
}
