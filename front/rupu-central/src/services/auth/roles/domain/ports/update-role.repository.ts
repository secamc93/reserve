/**
 * Puerto: Repositorio de Actualizar Rol
 */

import { UpdateRoleInput, UpdateRoleResult } from '../../entities';

export interface IUpdateRoleRepository {
  updateRole(input: UpdateRoleInput, token: string): Promise<UpdateRoleResult>;
}

