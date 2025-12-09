/**
 * Server Action: Crear Permiso
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { CreatePermissionUseCase } from '../../application';
import { PermissionsRepository } from '../repositories';
import { CreatePermissionParams } from '../../domain/entities';

export interface CreatePermissionResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    resource_id: number;
    action_id: number;
    scope_id: number;
    business_type_id?: number;
  };
  error?: string;
  message?: string;
}

export async function createPermissionAction(
  input: Omit<CreatePermissionParams, 'token'>,
  token: string
): Promise<CreatePermissionResult> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const createPermissionUseCase = new CreatePermissionUseCase(permissionsRepository);

    const result = await createPermissionUseCase.execute({ ...input, token });

    return result;
  } catch (error) {
    console.error('Error en createPermissionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
