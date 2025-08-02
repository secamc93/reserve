// Domain - User Entity
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserRolesPermissions {
  isSuper: boolean;
  roles: Role[];
  permissions: Permission[];
} 