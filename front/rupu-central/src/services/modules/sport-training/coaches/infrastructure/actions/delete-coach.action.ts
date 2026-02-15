/**
 * Server Action: Delete Coach
 * Acción de servidor para eliminar un entrenador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { CoachesRepository } from '../repositories/coaches.repository';

export interface DeleteCoachInput {
  businessId: number;
  coachId: number;
  token: string;
}

export interface DeleteCoachResult {
  success: boolean;
  message?: string;
}

export async function deleteCoachAction(input: DeleteCoachInput): Promise<DeleteCoachResult> {
  try {
    const repo = new CoachesRepository();
    await repo.deleteCoach({
      businessId: input.businessId,
      coachId: input.coachId,
      token: input.token,
    });

    revalidatePath('/sport-training/coaches');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al eliminar entrenador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
