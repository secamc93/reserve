/**
 * Puerto para el repositorio de roles
 */

import { RolesList } from '../../entities/role.entity';

export interface GetRolesParams {
  business_type_id?: number;
  scope_id?: number;
  is_system?: boolean;
  name?: string;
  level?: number;
}

export interface IRolesRepository {
  getRoles(token: string, params?: GetRolesParams): Promise<RolesList>;
}

