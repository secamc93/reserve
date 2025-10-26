/**
 * Puerto: Repositorio de Crear Rol
 */

import { CreateRoleInput, CreateRoleResult } from '../../entities';

export interface ICreateRoleRepository {
  createRole(input: CreateRoleInput, token: string): Promise<CreateRoleResult>;
}
