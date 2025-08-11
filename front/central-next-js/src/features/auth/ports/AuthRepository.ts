// Domain - Auth Repository (Port)
import { LoginCredentials, LoginResponse, ChangePasswordData } from '@/features/auth/domain/Auth';
import { UserRolesPermissions, ApiRolesPermissionsResponse } from '@/features/users/domain/User';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  getUserRolesPermissions(): Promise<ApiRolesPermissionsResponse>;
  changePassword(passwordData: ChangePasswordData): Promise<any>;
  logout(): void;
  isAuthenticated(): boolean;
  getToken(): string | null;
  getUserInfo(): any;
} 