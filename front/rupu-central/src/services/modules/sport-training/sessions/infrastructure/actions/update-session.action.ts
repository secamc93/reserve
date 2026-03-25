'use server';
import { revalidatePath } from 'next/cache';
import { SessionsRepository } from '../repositories/sessions.repository';
import { UpdateSessionDTO } from '../../domain';

export interface UpdateSessionInput { businessId: number; sessionId: number; token: string; data: UpdateSessionDTO; }
export interface UpdateSessionResult { success: boolean; message?: string; }

export async function updateSessionAction(input: UpdateSessionInput): Promise<UpdateSessionResult> {
  try {
    const repo = new SessionsRepository();
    await repo.updateSession({ businessId: input.businessId, sessionId: input.sessionId, token: input.token, data: input.data });
    revalidatePath('/sport-training/sessions');
    revalidatePath(`/sport-training/sessions/${input.sessionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar sesion:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
