/**
 * Server Action: Assign Specialty to Coach
 * Acción de servidor para asignar especialidad a un entrenador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { CoachesRepository } from '../repositories/coaches.repository';
import { AssignCoachSpecialtyDTO } from '../../domain';

export interface AssignSpecialtyInput {
  token: string;
  data: AssignCoachSpecialtyDTO;
}

export interface AssignSpecialtyResult {
  success: boolean;
  message?: string;
}

export async function assignSpecialtyAction(input: AssignSpecialtyInput): Promise<AssignSpecialtyResult> {
  try {
    const repo = new CoachesRepository();
    await repo.assignSpecialty({
      token: input.token,
      data: input.data,
    });

    revalidatePath('/sport-training/coaches');
    revalidatePath(`/sport-training/coaches/${input.data.coachId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al asignar especialidad:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
