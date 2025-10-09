/**
 * Puerto para el repositorio de lista de permisos
 */

import { PermissionsList } from '../entities/permission.entity';

export interface IPermissionsListRepository {
  getPermissions(token: string): Promise<PermissionsList>;
}

