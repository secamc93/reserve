/**
 * Server Action: Obtener Permiso por ID
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetPermissionByIdUseCase } from '../../application';
import { PermissionsRepository } from '../repositories';
import { GetPermissionByIdParams, GetPermissionByIdResponse } from '../../domain/entities';

export async function getPermissionByIdAction(
  params: GetPermissionByIdParams
): Promise<GetPermissionByIdResponse> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const getPermissionByIdUseCase = new GetPermissionByIdUseCase(permissionsRepository);

    return await getPermissionByIdUseCase.execute(params);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error desconocido al obtener permiso'
    );
  }
}
