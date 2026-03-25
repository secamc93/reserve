'use server';
import { SessionsRepository } from '../repositories/sessions.repository';

export async function getSessionsAction(input: { businessId: number; token: string; page?: number; pageSize?: number }) {
  try {
    const repo = new SessionsRepository();
    return { success: true as const, data: await repo.getSessions(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getSessionByIdAction(input: { businessId: number; sessionId: number; token: string }) {
  try {
    const repo = new SessionsRepository();
    return { success: true as const, data: await repo.getSessionById(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
