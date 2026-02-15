/**
 * Server Action: Update Player
 * Acción de servidor para actualizar un jugador
 */
'use server';

import { revalidatePath } from 'next/cache';
import { PlayersRepository } from '../repositories/players.repository';
import { UpdatePlayerDTO } from '../../domain';

export interface UpdatePlayerInput {
  businessId: number;
  playerId: number;
  token: string;
  data: UpdatePlayerDTO;
}

export interface UpdatePlayerResult {
  success: boolean;
  message?: string;
}

export async function updatePlayerAction(input: UpdatePlayerInput): Promise<UpdatePlayerResult> {
  try {
    const repo = new PlayersRepository();
    await repo.updatePlayer({
      businessId: input.businessId,
      playerId: input.playerId,
      token: input.token,
      data: input.data,
    });

    // Revalidar páginas relevantes
    revalidatePath('/sport-training/players');
    revalidatePath(`/sport-training/players/${input.playerId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
