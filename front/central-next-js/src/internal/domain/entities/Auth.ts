// Domain - Auth Entities
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: import('./User').User;
    require_password_change?: boolean;
  };
  user?: import('./User').User;
  token?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: import('./User').User | null;
  loading: boolean;
  userRolesPermissions: import('./User').UserRolesPermissions | null;
} 