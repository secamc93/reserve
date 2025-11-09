/**
 * Caso de uso: Obtener un permiso por ID
 */

import { IPermissionsRepository } from '../../domain/ports/permissions/permissions.repository';
import {
  GetPermissionByIdParams,
  GetPermissionByIdResponse,
} from '../../domain/entities/get-permission-by-id.entity';

export class GetPermissionByIdUseCase {
  constructor(private readonly permissionsRepository: IPermissionsRepository) {}

  async execute(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse> {
    return this.permissionsRepository.getPermissionById(params);
  }
}



