'use server';

import { UpdatePermissionUseCase } from '../../../application/permissions/update-permission.use-case';
import { PermissionsRepository } from '../../repositories/permissions';
import { UpdatePermissionParams, UpdatePermissionResponse } from '../../../domain/entities/update-permission.entity';

export async function updatePermissionAction(
  params: UpdatePermissionParams
): Promise<UpdatePermissionResponse> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const updatePermissionUseCase = new UpdatePermissionUseCase(permissionsRepository);

    return await updatePermissionUseCase.execute(params);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error desconocido al actualizar permiso',
    };
  }
}



