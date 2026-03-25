'use server';
import { CoachesRepository } from '../repositories/coaches.repository';

export async function getCoachesAction(input: { businessId: number; token: string; page?: number; pageSize?: number }) {
  try {
    const repo = new CoachesRepository();
    return { success: true as const, data: await repo.getCoaches(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getCoachByIdAction(input: { businessId: number; coachId: number; token: string }) {
  try {
    const repo = new CoachesRepository();
    return { success: true as const, data: await repo.getCoachById(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
