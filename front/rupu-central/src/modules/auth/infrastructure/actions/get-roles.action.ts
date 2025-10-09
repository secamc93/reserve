/**
 * Server Action: Obtener Roles
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetRolesUseCase } from '../../application/get-roles.use-case';
import { RolesRepository } from '../repositories/roles.repository';

interface RoleData {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
}

export interface GetRolesResult {
  success: boolean;
  data?: {
    roles: RoleData[];
    count: number;
  };
  error?: string;
}

export async function getRolesAction(token: string): Promise<GetRolesResult> {
  try {
    console.log('🔑 getRolesAction - Token recibido:', token ? 'Sí' : 'No');
    
    const rolesRepository = new RolesRepository();
    const getRolesUseCase = new GetRolesUseCase(rolesRepository);
    
    const result = await getRolesUseCase.execute({ token });

    console.log('✅ Roles obtenidos del backend:', result.roles.count);

    return {
      success: true,
      data: {
        roles: result.roles.roles,
        count: result.roles.count,
      },
    };
  } catch (error) {
    console.error('❌ Error en getRolesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

