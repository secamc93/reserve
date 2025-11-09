/**
 * Entidad Permission (Permiso del sistema)
 */

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  resourceId: number;
  action: string;
  actionId: number;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
  businessTypeId?: number;
  businessTypeName?: string;
}

export interface PermissionsList {
  permissions: Permission[];
  total: number;
}

