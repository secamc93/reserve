'use server';
import { GroupsRepository } from '../repositories/groups.repository';

export async function getGroupsAction(input: { businessId: number; token: string; page?: number; pageSize?: number }) {
  try {
    const repo = new GroupsRepository();
    return { success: true as const, data: await repo.getGroups(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getGroupByIdAction(input: { businessId: number; groupId: number; token: string }) {
  try {
    const repo = new GroupsRepository();
    return { success: true as const, data: await repo.getGroupById(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getGroupPlayersAction(input: { groupId: number; businessId: number; token: string }) {
  try {
    const repo = new GroupsRepository();
    return { success: true as const, data: await repo.getGroupPlayers(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
