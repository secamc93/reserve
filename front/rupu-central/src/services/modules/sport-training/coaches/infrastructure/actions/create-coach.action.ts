/**
 * Server Action: Create Coach
 * Acción de servidor para crear un nuevo entrenador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { CoachesRepository } from '../repositories/coaches.repository';
import { CreateCoachDTO } from '../../domain';

export interface CreateCoachInput {
  token: string;
  data: CreateCoachDTO;
}

export interface CreateCoachResult {
  success: boolean;
  message?: string;
  coachId?: number;
}

export async function createCoachAction(input: CreateCoachInput): Promise<CreateCoachResult> {
  try {
    const repo = new CoachesRepository();
    const coach = await repo.createCoach({
      token: input.token,
      data: input.data,
    });

    revalidatePath('/sport-training/coaches');

    return {
      success: true,
      coachId: coach.id,
    };
  } catch (error) {
    console.error('Error al crear entrenador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
