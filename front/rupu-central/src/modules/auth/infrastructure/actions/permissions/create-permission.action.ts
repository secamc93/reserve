/**
 * Server Action: Crear Permiso
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { CreatePermissionUseCase } from '../../../application/permissions/create-permission.use-case';
import { CreatePermissionRepository } from '../../../infrastructure/repositories/permissions/create-permission.repository';

export interface CreatePermissionInput {
  name: string;
  description?: string;
  resource_id: number;
  action_id: number; // Pendiente: implementar lista de acciones
  scope_id: number;
  business_type_id?: number;
}

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
}

export async function createPermissionAction(
  input: CreatePermissionInput,
  token: string
): Promise<CreatePermissionResult> {
  try {
    console.log('🔑 createPermissionAction - Creando permiso:', input.name);
    
    const createPermissionRepository = new CreatePermissionRepository();
    const createPermissionUseCase = new CreatePermissionUseCase(createPermissionRepository);
    
    const result = await createPermissionUseCase.execute(input, token);

    if (result.success) {
      console.log('✅ Permiso creado exitosamente:', result.data?.name);
    } else {
      console.log('❌ Error creando permiso:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en createPermissionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

