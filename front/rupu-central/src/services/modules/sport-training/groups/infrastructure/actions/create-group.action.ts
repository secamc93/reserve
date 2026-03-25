'use server';

import { revalidatePath } from 'next/cache';
import { GroupsRepository } from '../repositories/groups.repository';
import { CreateGroupDTO } from '../../domain';

export interface CreateGroupInput { token: string; data: CreateGroupDTO; }
export interface CreateGroupResult { success: boolean; message?: string; groupId?: number; }

export async function createGroupAction(input: CreateGroupInput): Promise<CreateGroupResult> {
  try {
    const repo = new GroupsRepository();
    const group = await repo.createGroup({ token: input.token, data: input.data });
    revalidatePath('/sport-training/groups');
    return { success: true, groupId: group.id };
  } catch (error) {
    console.error('Error al crear grupo:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
