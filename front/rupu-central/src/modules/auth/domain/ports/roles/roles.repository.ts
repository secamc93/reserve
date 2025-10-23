/**
 * Puerto para el repositorio de roles
 */

import { RolesList } from '../../entities/role.entity';

export interface IRolesRepository {
  getRoles(token: string): Promise<RolesList>;
}

