/**
 * Entidad Role (Domain)
 * Representa un rol del sistema
 */

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
}

export interface RolesList {
  roles: Role[];
  count: number;
}

