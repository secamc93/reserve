/**
 * Server Action: Update Coach
 * Acción de servidor para actualizar un entrenador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { CoachesRepository } from '../repositories/coaches.repository';
import { UpdateCoachDTO } from '../../domain';

export interface UpdateCoachInput {
  businessId: number;
  coachId: number;
  token: string;
  data: UpdateCoachDTO;
}

export interface UpdateCoachResult {
  success: boolean;
  message?: string;
}

export async function updateCoachAction(input: UpdateCoachInput): Promise<UpdateCoachResult> {
  try {
    const repo = new CoachesRepository();
    await repo.updateCoach({
      businessId: input.businessId,
      coachId: input.coachId,
      token: input.token,
      data: input.data,
    });

    revalidatePath('/sport-training/coaches');
    revalidatePath(`/sport-training/coaches/${input.coachId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al actualizar entrenador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
