/**
 * Puerto para el repositorio de permisos
 */

import { UserPermissions } from '../entities/permissions.entity';

export interface IPermissionsRepository {
  getRolesAndPermissions(businessId: number, token: string): Promise<UserPermissions>;
}

