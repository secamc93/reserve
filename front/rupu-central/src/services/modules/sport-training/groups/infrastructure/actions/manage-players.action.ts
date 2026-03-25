'use server';

import { revalidatePath } from 'next/cache';
import { GroupsRepository } from '../repositories/groups.repository';

export interface AddPlayerToGroupInput { groupId: number; playerId: number; token: string; notes?: string; }
export interface RemovePlayerFromGroupInput { groupId: number; playerId: number; token: string; }
export interface ManagePlayerResult { success: boolean; message?: string; }

export async function addPlayerToGroupAction(input: AddPlayerToGroupInput): Promise<ManagePlayerResult> {
  try {
    const repo = new GroupsRepository();
    await repo.addPlayer({ groupId: input.groupId, token: input.token, data: { playerId: input.playerId, notes: input.notes } });
    revalidatePath(`/sport-training/groups/${input.groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function removePlayerFromGroupAction(input: RemovePlayerFromGroupInput): Promise<ManagePlayerResult> {
  try {
    const repo = new GroupsRepository();
    await repo.removePlayer({ groupId: input.groupId, playerId: input.playerId, token: input.token });
    revalidatePath(`/sport-training/groups/${input.groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al remover jugador:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
