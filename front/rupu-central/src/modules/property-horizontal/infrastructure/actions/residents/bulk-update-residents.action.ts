'use server';

import { BulkUpdateResidentsUseCase } from '../../../application';
import { ResidentsRepository } from '../../repositories/residents.repository';

export interface BulkUpdateResidentsInput {
  token: string;
  hpId: number;
  file: File;
}

export interface BulkUpdateResidentsResult {
  success: boolean;
  message?: string;
  data?: {
    total_processed: number;
    updated: number;
    errors: number;
    error_details: Array<{
      row: number;
      property_unit_number: string;
      error: string;
    }>;
  };
  error?: string;
}

export async function bulkUpdateResidentsAction(
  input: BulkUpdateResidentsInput
): Promise<BulkUpdateResidentsResult> {
  try {
    const repository = new ResidentsRepository();
    const useCase = new BulkUpdateResidentsUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      hpId: input.hpId,
      file: input.file,
    });

    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error('❌ Error en bulkUpdateResidentsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
