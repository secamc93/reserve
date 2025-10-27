/**
 * Entidad Permission (Permiso del sistema)
 */

export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
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

