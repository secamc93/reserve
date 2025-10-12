/**
 * Server Action: Obtener propiedades horizontales
 */

'use server';

import { GetHorizontalPropertiesUseCase } from '../../../application';
import { HorizontalPropertiesRepository } from '../../repositories/horizontal-properties.repository';
import { HorizontalProperty } from '../../../domain/entities';

export interface GetHorizontalPropertiesInput {
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface GetHorizontalPropertiesResult {
  success: boolean;
  data?: {
    data: HorizontalProperty[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

export async function getHorizontalPropertiesAction(
  input: GetHorizontalPropertiesInput
): Promise<GetHorizontalPropertiesResult> {
  try {
    const repository = new HorizontalPropertiesRepository();
    const useCase = new GetHorizontalPropertiesUseCase(repository);
    const result = await useCase.execute(input);

    return {
      success: true,
      data: {
        data: result.properties.data,
        total: result.properties.total,
        page: result.properties.page,
        pageSize: result.properties.pageSize,
        totalPages: result.properties.totalPages,
      },
    };
  } catch (error) {
    console.error('Error en getHorizontalPropertiesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

