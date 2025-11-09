'use server';

import { BulkUpdateResidentsUseCase } from '../../../application';
import { ResidentsRepository } from '../../repositories/residents';

export interface BulkUpdateResidentsInput {
  token: string;
  businessId: number;
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

    const response = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      file: input.file,
    });

    return {
      success: response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error en bulkUpdateResidentsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
