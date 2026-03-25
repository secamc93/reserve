'use server';

import { revalidatePath } from 'next/cache';
import { GroupsRepository } from '../repositories/groups.repository';
import { UpdateGroupDTO } from '../../domain';

export interface UpdateGroupInput { businessId: number; groupId: number; token: string; data: UpdateGroupDTO; }
export interface UpdateGroupResult { success: boolean; message?: string; }

export async function updateGroupAction(input: UpdateGroupInput): Promise<UpdateGroupResult> {
  try {
    const repo = new GroupsRepository();
    await repo.updateGroup({ businessId: input.businessId, groupId: input.groupId, token: input.token, data: input.data });
    revalidatePath('/sport-training/groups');
    revalidatePath(`/sport-training/groups/${input.groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
