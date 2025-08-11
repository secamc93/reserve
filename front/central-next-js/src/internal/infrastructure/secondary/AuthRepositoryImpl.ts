// Infrastructure - Auth Repository Implementation (Secondary Adapter)
import { AuthRepository } from '../../domain/ports/AuthRepository';
import { LoginCredentials, LoginResponse, ChangePasswordData } from '../../domain/entities/Auth';
import { User, Business, UserRolesPermissions, ApiRolesPermissionsResponse } from '../../domain/entities/User';
import { HttpClient } from '../primary/HttpClient';

export class AuthRepositoryImpl implements AuthRepository {
  private httpClient: HttpClient;

  constructor(baseURL: string) {
    this.httpClient = new HttpClient(baseURL);
  }

  private mapBusinessFromBackend(b: any): Business {
    return {
      id: b.id,
      name: b.name,
      code: b.code,
      businessTypeId: b.business_type_id,
      timezone: b.timezone,
      address: b.address,
      description: b.description,
      logoURL: b.logo_url,
      primaryColor: b.primary_color,
      secondaryColor: b.secondary_color,
      customDomain: b.custom_domain,
      isActive: b.is_active,
      enableDelivery: b.enable_delivery,
      enablePickup: b.enable_pickup,
      enableReservations: b.enable_reservations,
      businessTypeName: b.business_type?.name || b.business_type_name,
      businessTypeCode: b.business_type?.code || b.business_type_code,
    };
  }

  private mapUserFromBackend(u: any): User {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatarURL: u.avatar_url,
      isActive: u.is_active,
      roles: u.roles ? u.roles.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        level: r.level,
        isSystem: r.is_system,
        scopeId: r.scope_id,
        scopeName: r.scope_name,
        scopeCode: r.scope_code,
      })) : [],
      businesses: u.businesses ? u.businesses.map((b: any) => this.mapBusinessFromBackend(b)) : [],
      createdAt: u.created_at || '',
      updatedAt: u.updated_at || '',
      lastLoginAt: u.last_login_at,
      deletedAt: u.deleted_at,
    };
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 AuthRepositoryImpl: Iniciando login');
      console.log('🔐 AuthRepositoryImpl: Email:', credentials.email);

      const response = await this.httpClient.post('/api/v1/auth/login', credentials);

      console.log('🔐 AuthRepositoryImpl: Respuesta del servidor:', response);

      if (response.success && response.data) {
        const mappedUser = this.mapUserFromBackend(response.data.user);
        // Mezclar businesses del nivel superior (si vienen)
        if (Array.isArray(response.data.businesses)) {
          mappedUser.businesses = response.data.businesses.map((b: any) => this.mapBusinessFromBackend(b));
        }

        // Guardar token y usuario mapeado en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userInfo', JSON.stringify(mappedUser));
        }

        console.log('🔐 AuthRepositoryImpl: Login exitoso, token y usuario guardados');

        return {
          success: true,
          data: { ...response.data, user: mappedUser },
          user: mappedUser,
          token: response.data.token,
        };
      } else {
        console.error('🔐 AuthRepositoryImpl: Respuesta inválida del servidor');
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('🔐 AuthRepositoryImpl: Error en login:', error);
      throw error;
    }
  }

  async getUserRolesPermissions(): Promise<ApiRolesPermissionsResponse> {
    try {
      console.log('🔐 AuthRepositoryImpl: Obteniendo roles y permisos');

      const response = await this.httpClient.get('/api/v1/auth/roles-permissions');

      console.log('🔐 AuthRepositoryImpl: Respuesta de roles y permisos:', response);

      if (response.success && response.data) {
        return response as ApiRolesPermissionsResponse;
      } else {
        console.error('🔐 AuthRepositoryImpl: Respuesta inválida de roles y permisos');
        throw new Error('Respuesta inválida de roles y permisos');
      }
    } catch (error) {
      console.error('🔐 AuthRepositoryImpl: Error obteniendo roles y permisos:', error);
      throw error;
    }
  }

  async changePassword(passwordData: ChangePasswordData): Promise<any> {
    try {
      console.log('AuthRepositoryImpl: Cambiando contraseña');
      const response = await this.httpClient.post('/api/v1/auth/change-password', passwordData);
      console.log('AuthRepositoryImpl: Contraseña cambiada:', response);
      return response;
    } catch (error) {
      console.error('AuthRepositoryImpl: Error cambiando contraseña:', error);
      throw error;
    }
  }

  logout(): void {
    console.log('🔐 AuthRepositoryImpl: Cerrando sesión');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userRolesPermissions');
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  getUserInfo(): any {
    if (typeof window === 'undefined') return null;
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }
} 