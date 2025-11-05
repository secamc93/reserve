/**
 * Puerto: Repositorio de Obtener Permisos de un Rol
 */

import { GetRolePermissionsInput, GetRolePermissionsResult } from '../../entities';

export interface IGetRolePermissionsRepository {
  getRolePermissions(input: GetRolePermissionsInput, token: string): Promise<GetRolePermissionsResult>;
}

