/**
 * Server Action: Delete Player
 * Acción de servidor para eliminar un jugador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { PlayersRepository } from '../repositories/players.repository';

export interface DeletePlayerInput {
  businessId: number;
  playerId: number;
  token: string;
}

export interface DeletePlayerResult {
  success: boolean;
  message?: string;
}

export async function deletePlayerAction(input: DeletePlayerInput): Promise<DeletePlayerResult> {
  try {
    const repo = new PlayersRepository();
    await repo.deletePlayer({
      businessId: input.businessId,
      playerId: input.playerId,
      token: input.token,
    });

    // Revalidar la página de listado
    revalidatePath('/sport-training/players');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
