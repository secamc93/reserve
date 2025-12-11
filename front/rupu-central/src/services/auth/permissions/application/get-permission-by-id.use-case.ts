/**
 * Caso de uso: Obtener un permiso por ID
 */

import { IPermissionsRepository } from '../domain/ports';
import { GetPermissionByIdParams, GetPermissionByIdResponse } from '../domain/entities';

export class GetPermissionByIdUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse> {
    return await this.permissionsRepository.getPermissionById(params);
  }
}
