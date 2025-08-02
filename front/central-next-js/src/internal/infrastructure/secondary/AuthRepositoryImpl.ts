// Infrastructure - Auth Repository Implementation (Secondary Adapter)
import { AuthRepository } from '../../domain/ports/AuthRepository';
import { LoginCredentials, LoginResponse, ChangePasswordData } from '../../domain/entities/Auth';
import { UserRolesPermissions } from '../../domain/entities/User';
import { HttpClient } from '../primary/HttpClient';

export class AuthRepositoryImpl implements AuthRepository {
  private httpClient: HttpClient;

  constructor(baseURL: string) {
    this.httpClient = new HttpClient(baseURL);
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 AuthRepositoryImpl: Iniciando login');
      console.log('🔐 AuthRepositoryImpl: Email:', credentials.email);

      const response = await this.httpClient.post('/api/v1/auth/login', credentials);

      console.log('🔐 AuthRepositoryImpl: Respuesta del servidor:', response);

      if (response.success && response.data) {
        // Guardar token en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        }

        console.log('🔐 AuthRepositoryImpl: Login exitoso, token guardado');

        return {
          success: true,
          data: response.data,
          user: response.data.user,
          token: response.data.token
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

  async getUserRolesPermissions(): Promise<UserRolesPermissions> {
    try {
      console.log('🔐 AuthRepositoryImpl: Obteniendo roles y permisos');

      const response = await this.httpClient.get('/api/v1/auth/roles-permissions');

      console.log('🔐 AuthRepositoryImpl: Respuesta de roles y permisos:', response);

      if (response.success && response.data) {
        return {
          isSuper: response.data.is_super,
          roles: response.data.roles || [],
          permissions: response.data.permissions || []
        };
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