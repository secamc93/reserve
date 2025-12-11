/**
 * Entidades del dominio Dashboard
 */

export interface DashboardStats {
  users: UserStats;
  roles: RoleStats;
  permissions: PermissionStats;
  resources: ResourceStats;
  businesses: BusinessStats;
  business_types: BusinessTypeStats;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  super_users: number;
}

export interface RoleStats {
  total: number;
  system: number;
  custom: number;
}

export interface PermissionStats {
  total: number;
  assigned: number;
  unassigned: number;
}

export interface ResourceStats {
  total: number;
  active: number;
  inactive: number;
}

export interface BusinessStats {
  total: number;
  active: number;
  inactive: number;
}

export interface BusinessTypeStats {
  total: number;
}
