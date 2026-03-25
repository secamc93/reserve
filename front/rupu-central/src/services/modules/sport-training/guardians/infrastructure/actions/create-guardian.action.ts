'use server';

import { revalidatePath } from 'next/cache';
import { GuardiansRepository } from '../repositories/guardians.repository';
import { CreateGuardianDTO } from '../../domain';

export interface CreateGuardianInput {
  token: string;
  data: CreateGuardianDTO;
}

export interface CreateGuardianResult {
  success: boolean;
  message?: string;
  guardianId?: number;
}

export async function createGuardianAction(input: CreateGuardianInput): Promise<CreateGuardianResult> {
  try {
    const repo = new GuardiansRepository();
    const guardian = await repo.createGuardian({
      token: input.token,
      data: input.data,
    });

    revalidatePath('/sport-training/guardians');

    return { success: true, guardianId: guardian.id };
  } catch (error) {
    console.error('Error al crear tutor:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
