'use server';
import { revalidatePath } from 'next/cache';
import { SessionsRepository } from '../repositories/sessions.repository';
import { CreateSessionDTO } from '../../domain';

export interface CreateSessionInput { token: string; data: CreateSessionDTO; }
export interface CreateSessionResult { success: boolean; message?: string; sessionId?: number; }

export async function createSessionAction(input: CreateSessionInput): Promise<CreateSessionResult> {
  try {
    const repo = new SessionsRepository();
    const session = await repo.createSession({ token: input.token, data: input.data });
    revalidatePath('/sport-training/sessions');
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error('Error al crear sesion:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
