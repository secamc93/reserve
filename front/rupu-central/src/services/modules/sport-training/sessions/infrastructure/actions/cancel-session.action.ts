'use server';
import { revalidatePath } from 'next/cache';
import { SessionsRepository } from '../repositories/sessions.repository';

export interface CancelSessionInput { sessionId: number; token: string; reason: string; }
export interface CancelSessionResult { success: boolean; message?: string; }

export async function cancelSessionAction(input: CancelSessionInput): Promise<CancelSessionResult> {
  try {
    const repo = new SessionsRepository();
    await repo.cancelSession({ sessionId: input.sessionId, token: input.token, reason: input.reason });
    revalidatePath('/sport-training/sessions');
    revalidatePath(`/sport-training/sessions/${input.sessionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al cancelar sesion:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
