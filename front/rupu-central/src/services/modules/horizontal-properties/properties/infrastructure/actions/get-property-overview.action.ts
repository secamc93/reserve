/**
 * Server Action: Resumen de una propiedad para su tarjeta en "Elige una propiedad"
 */

'use server';

import { GetPropertyOverviewUseCase } from '../../application';
import { HorizontalPropertiesRepository } from '../repositories';
import { PropertyOverview } from '../../domain/entities';

export type GetPropertyOverviewResult = { success: true; data: PropertyOverview } | { success: false; error: string };

export async function getPropertyOverviewAction(input: { token: string; businessId: number }): Promise<GetPropertyOverviewResult> {
  try {
    const useCase = new GetPropertyOverviewUseCase(new HorizontalPropertiesRepository());
    return { success: true, data: await useCase.execute(input) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
