/**
 * Server Action: Create Player
 * Acción de servidor para crear un nuevo jugador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { PlayersRepository } from '../repositories/players.repository';
import { CreatePlayerDTO } from '../../domain';

export interface CreatePlayerInput {
  token: string;
  data: CreatePlayerDTO;
}

export interface CreatePlayerResult {
  success: boolean;
  message?: string;
  playerId?: number;
}

export async function createPlayerAction(input: CreatePlayerInput): Promise<CreatePlayerResult> {
  try {
    const repo = new PlayersRepository();
    const player = await repo.createPlayer({
      token: input.token,
      data: input.data,
    });

    // Revalidar la página de listado de jugadores
    revalidatePath('/sport-training/players');

    return {
      success: true,
      playerId: player.id,
    };
  } catch (error) {
    console.error('Error al crear jugador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
