'use server';
import { PlayersRepository } from '../repositories/players.repository';

export async function getPlayersAction(input: { businessId: number; token: string; page?: number; pageSize?: number }) {
  try {
    const repo = new PlayersRepository();
    return { success: true as const, data: await repo.getPlayers(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getPlayerByIdAction(input: { businessId: number; playerId: number; token: string }) {
  try {
    const repo = new PlayersRepository();
    return { success: true as const, data: await repo.getPlayerById(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
