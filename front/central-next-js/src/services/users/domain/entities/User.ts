// Domain - User Entity
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarURL?: string;
  isActive: boolean;
  roles: Role[];
  businesses: Business[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName?: string;
  scopeCode?: string;
}

export interface Business {
  id: number;
  name: string;
  code: string;
  businessTypeId: number;
  timezone: string;
  address?: string;
  description?: string;
  logoURL?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
  navbarImageURL?: string;
  customDomain?: string;
  isActive: boolean;
  enableDelivery: boolean;
  enablePickup: boolean;
  enableReservations: boolean;
  businessTypeName?: string;
  businessTypeCode?: string;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

export interface ResourceAction {
  id: number;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
}

export interface Resource {
  resource: string;
  resource_name: string;
  actions: ResourceAction[];
}

export interface UserRolesPermissions {
  isSuper: boolean;
  roles: Role[];
  permissions: Permission[];
}

// Nueva interfaz para la respuesta real de la API
export interface ApiRolesPermissionsResponse {
  success: boolean;
  data: {
    is_super: boolean;
    roles: Role[];
    resources: Resource[];
    permissions?: Permission[];
  };
}

// DTOs para operaciones
export interface CreateUserDTO {
  name: string;
  email: string;
  phone?: string;
  avatarURL?: string;
  avatarFile?: File;
  isActive: boolean;
  roleIds: number[];
  businessIds: number[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  avatarURL?: string;
  avatarFile?: File;
  isActive?: boolean;
  roleIds?: number[];
  businessIds?: number[];
}

export interface UserFilters {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  roleId?: number;
  businessId?: number;
  createdAt?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListDTO {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 