/**
 * Puerto: Repositorio de Remover Permiso de un Rol
 */

import { RemoveRolePermissionInput, RemoveRolePermissionResult } from '../../entities';

export interface IRemoveRolePermissionRepository {
  removePermission(input: RemoveRolePermissionInput, token: string): Promise<RemoveRolePermissionResult>;
}

