'use server';

import { GetPermissionByIdUseCase } from '../../../application/permissions/get-permission-by-id.use-case';
import { PermissionsRepository } from '../../repositories/permissions';
import {
  GetPermissionByIdParams,
  GetPermissionByIdResponse,
} from '../../../domain/entities/get-permission-by-id.entity';

export async function getPermissionByIdAction(
  params: GetPermissionByIdParams
): Promise<GetPermissionByIdResponse> {
  const permissionsRepository = new PermissionsRepository();
  const getPermissionByIdUseCase = new GetPermissionByIdUseCase(permissionsRepository);

  return getPermissionByIdUseCase.execute(params);
}



