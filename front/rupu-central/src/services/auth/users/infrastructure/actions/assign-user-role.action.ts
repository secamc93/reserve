/**
 * Server Action: Asignar Roles a Usuario
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UsersUseCases } from '../../application';
import { AssignUserRoleParams } from '../../domain/entities/assign-user-role.entity';
import { UsersRepository } from '../repositories';

export interface AssignUserRoleResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function assignUserRoleAction(
  params: AssignUserRoleParams, 
  authUseCases?: UsersUseCases
): Promise<AssignUserRoleResult> {
  try {
    console.log('👤 assignUserRoleAction - Asignando roles:', {
      userId: params.user_id,
      assignmentsCount: params.assignments.length,
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new UsersUseCases(
      new UsersRepository()
    );
    const result = await useCases.UseCaseAssignUserRole.execute(params);

    console.log('✅ Roles asignados exitosamente');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('❌ Error en assignUserRoleAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
