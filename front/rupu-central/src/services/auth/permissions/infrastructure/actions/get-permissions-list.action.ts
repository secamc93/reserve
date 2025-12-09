/**
 * Server Action: Obtener lista de Permisos
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetPermissionsListUseCase } from '../../application';
import { PermissionsRepository } from '../repositories';
import { GetPermissionsParams } from '../../domain/entities';

export interface GetPermissionsListResult {
  success: boolean;
  data?: {
    permissions: Array<{
      id: number;
      name: string;
      description: string;
      resource: string;
      resourceId: number;
      action: string;
      actionId: number;
      scopeId: number;
      scopeName: string;
      scopeCode: string;
      businessTypeId?: number;
      businessTypeName?: string;
    }>;
    total: number;
  };
  error?: string;
  message?: string;
}

export async function getPermissionsListAction(
  token: string,
  params?: { business_type_id?: number }
): Promise<GetPermissionsListResult> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const getPermissionsListUseCase = new GetPermissionsListUseCase(permissionsRepository);

    const result = await getPermissionsListUseCase.execute({ token, business_type_id: params?.business_type_id });

    return {
      success: true,
      data: {
        permissions: result.permissions,
        total: result.total,
      },
    };
  } catch (error) {
    console.error('Error en getPermissionsListAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
