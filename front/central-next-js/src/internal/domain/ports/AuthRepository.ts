// Domain - Auth Repository (Port)
import { LoginCredentials, LoginResponse, ChangePasswordData } from '../entities/Auth';
import { UserRolesPermissions } from '../entities/User';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  getUserRolesPermissions(): Promise<UserRolesPermissions>;
  changePassword(passwordData: ChangePasswordData): Promise<any>;
  logout(): void;
  isAuthenticated(): boolean;
  getToken(): string | null;
  getUserInfo(): any;
} 