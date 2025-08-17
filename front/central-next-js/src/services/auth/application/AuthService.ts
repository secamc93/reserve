// Application - Auth Service
import { AuthUseCase } from './AuthUseCase';
import { AuthRepositoryHttp } from '@/features/auth/adapters/http/AuthRepositoryHttp';
import { LoginCredentials, LoginResponse, ChangePasswordData } from '@/services/auth/domain/entities/Auth';
import { UserRolesPermissions, ApiRolesPermissionsResponse } from '@/services/users/domain/entities/User';

export class AuthService {
  private authUseCase: AuthUseCase;

  constructor(baseURL: string) {
    const authRepository = new AuthRepositoryHttp(baseURL);
    this.authUseCase = new AuthUseCase(authRepository);
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse & { requirePasswordChange?: boolean }> {
    return this.authUseCase.login(credentials);
  }

  async getUserRolesPermissions(): Promise<ApiRolesPermissionsResponse> {
    return this.authUseCase.getUserRolesPermissions();
  }

  async changePassword(passwordData: ChangePasswordData): Promise<any> {
    return this.authUseCase.changePassword(passwordData);
  }

  logout(): void {
    this.authUseCase.logout();
  }

  isAuthenticated(): boolean {
    return this.authUseCase.isAuthenticated();
  }

  getToken(): string | null {
    return this.authUseCase.getToken();
  }

  getUserInfo(): any {
    return this.authUseCase.getUserInfo();
  }

  // Métodos de utilidad para verificar permisos
  hasPermission(permissions: UserRolesPermissions | null, permission: string): boolean {
    return this.authUseCase.hasPermission(permissions, permission);
  }

  hasRole(permissions: UserRolesPermissions | null, role: string): boolean {
    return this.authUseCase.hasRole(permissions, role);
  }

  isSuperAdmin(permissions: UserRolesPermissions | null): boolean {
    return this.authUseCase.isSuperAdmin(permissions);
  }
} 