/**
 * Puerto: Repositorio de Asignar Permisos a Rol
 */

import { AssignRolePermissionsInput, AssignRolePermissionsResult } from '../../entities';

export interface IAssignRolePermissionsRepository {
  assignPermissions(input: AssignRolePermissionsInput, token: string): Promise<AssignRolePermissionsResult>;
}

