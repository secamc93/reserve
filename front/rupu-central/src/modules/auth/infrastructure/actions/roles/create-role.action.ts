/**
 * Server Action: Crear Rol
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { CreateRoleUseCase } from '../../../application/roles/create-role.use-case';
import { CreateRoleRepository } from '../../../infrastructure/repositories/roles/create-role.repository';
import { CreateRoleInput, CreateRoleResult } from '../../../domain/entities';

export interface CreateRoleActionInput extends CreateRoleInput {
  token: string;
}

export async function createRoleAction(input: CreateRoleActionInput): Promise<CreateRoleResult> {
  try {
    console.log('🔑 createRoleAction - Creando rol:', input.name);
    
    const createRoleRepository = new CreateRoleRepository();
    const createRoleUseCase = new CreateRoleUseCase(createRoleRepository);
    
    const result = await createRoleUseCase.execute(input);

    if (result.success) {
      console.log('✅ Rol creado exitosamente:', result.data?.name);
    } else {
      console.log('❌ Error creando rol:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en createRoleAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
