// Domain - Auth Entities
export interface LoginCredentials {
  email: string;
  password: string;
}

import type { User, UserRolesPermissions } from '@/services/users/domain/entities/User';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    require_password_change?: boolean;
  };
  user?: User;
  token?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  userRolesPermissions: UserRolesPermissions | null;
}