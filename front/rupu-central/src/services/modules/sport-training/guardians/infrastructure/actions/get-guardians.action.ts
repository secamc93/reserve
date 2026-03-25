'use server';
import { GuardiansRepository } from '../repositories/guardians.repository';

export async function getGuardiansAction(input: { businessId: number; token: string; page?: number; pageSize?: number }) {
  try {
    const repo = new GuardiansRepository();
    return { success: true as const, data: await repo.getGuardians(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getGuardianByIdAction(input: { businessId: number; guardianId: number; token: string }) {
  try {
    const repo = new GuardiansRepository();
    return { success: true as const, data: await repo.getGuardianById(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
