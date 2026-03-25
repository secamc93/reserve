'use server';

import { revalidatePath } from 'next/cache';
import { GuardiansRepository } from '../repositories/guardians.repository';
import { UpdateGuardianDTO } from '../../domain';

export interface UpdateGuardianInput {
  businessId: number;
  guardianId: number;
  token: string;
  data: UpdateGuardianDTO;
}

export interface UpdateGuardianResult {
  success: boolean;
  message?: string;
}

export async function updateGuardianAction(input: UpdateGuardianInput): Promise<UpdateGuardianResult> {
  try {
    const repo = new GuardiansRepository();
    await repo.updateGuardian({
      businessId: input.businessId,
      guardianId: input.guardianId,
      token: input.token,
      data: input.data,
    });

    revalidatePath('/sport-training/guardians');
    revalidatePath(`/sport-training/guardians/${input.guardianId}`);

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar tutor:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
