// Application - Auth Use Case
import { AuthRepository } from '@/features/auth/ports/AuthRepository';
import { LoginCredentials, LoginResponse, ChangePasswordData } from '@/features/auth/domain/Auth';
import { UserRolesPermissions, ApiRolesPermissionsResponse } from '@/features/users/domain/User';

export class AuthUseCase {
  constructor(private authRepository: AuthRepository) {}

  async login(credentials: LoginCredentials): Promise<LoginResponse & { requirePasswordChange?: boolean }> {
    try {
      const result = await this.authRepository.login(credentials);
      
      if (result.success && result.data?.require_password_change) {
        return { ...result, requirePasswordChange: true };
      }

      // Obtener roles y permisos después del login exitoso
      try {
        const rolesPermissions = await this.authRepository.getUserRolesPermissions();
        console.log('Roles y permisos obtenidos:', rolesPermissions);
      } catch (rolesError) {
        console.warn('No se pudieron obtener roles y permisos:', rolesError);
      }

      return result;
    } catch (error) {
      console.error('Error en caso de uso de login:', error);
      throw error;
    }
  }

  async getUserRolesPermissions(): Promise<ApiRolesPermissionsResponse> {
    return this.authRepository.getUserRolesPermissions();
  }

  async changePassword(passwordData: ChangePasswordData): Promise<any> {
    return this.authRepository.changePassword(passwordData);
  }

  logout(): void {
    this.authRepository.logout();
  }

  isAuthenticated(): boolean {
    return this.authRepository.isAuthenticated();
  }

  getToken(): string | null {
    return this.authRepository.getToken();
  }

  getUserInfo(): any {
    return this.authRepository.getUserInfo();
  }

  // Métodos de utilidad para verificar permisos
  hasPermission(permissions: UserRolesPermissions | null, permission: string): boolean {
    if (!permissions) return false;
    return permissions.permissions.some(p => p.code === permission);
  }

  hasRole(permissions: UserRolesPermissions | null, role: string): boolean {
    if (!permissions) return false;
    return permissions.roles.some(r => r.code === role);
  }

  isSuperAdmin(permissions: UserRolesPermissions | null): boolean {
    return permissions?.isSuper === true;
  }
} 