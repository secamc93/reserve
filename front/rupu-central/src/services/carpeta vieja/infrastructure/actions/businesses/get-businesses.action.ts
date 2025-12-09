/**
 * Server Action: Obtener lista de businesses
 */

'use server';

import { GetBusinessesUseCase } from '../../../application/businesses';
import { BusinessesRepository } from '../../repositories/businesses';
import { IBusinessesRepository } from '../../../domain/ports';
import { GetBusinessesParams } from '../../../domain/ports/businesses.repository';

export interface GetBusinessesActionResult {
  success: boolean;
  data?: {
    businesses: Array<{
      id: number;
      name: string;
      description?: string;
      address: string;
      phone?: string;
      email?: string;
      website?: string;
      logo_url?: string;
      primary_color?: string;
      secondary_color?: string;
      tertiary_color?: string;
      quaternary_color?: string;
      navbar_image_url?: string;
      is_active: boolean;
      business_type_id: number;
      business_type?: string;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  error?: string;
  message?: string;
}

export async function getBusinessesAction(
  params: GetBusinessesParams,
  repository?: IBusinessesRepository
): Promise<GetBusinessesActionResult> {
  try {
    const businessesRepository = repository || new BusinessesRepository();
    const useCase = new GetBusinessesUseCase(businessesRepository);
    
    const result = await useCase.execute(params);

    return {
      success: true,
      data: {
        businesses: result.data,
        pagination: result.pagination,
      },
    };
  } catch (error) {
    console.error('Error en getBusinessesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

