/**
 * Use Case: Eliminar/Desactivar votación
 */

import { IVotingsRepository } from '../domain/ports/votings.repository';

export interface DeleteVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface DeleteVotingResult {
  message: string;
}

export type DeleteVotingInput = DeleteVotingParams;

export class DeleteVotingUseCase {
  constructor(private repository: IVotingsRepository) {}

  async execute(input: DeleteVotingInput): Promise<DeleteVotingResult> {
    // Validar que el ID de la votación sea válido
    if (!input.votingId || input.votingId <= 0) {
      throw new Error('ID de la votación inválido');
    }

    // Eliminar/desactivar votación
    const message = await this.repository.deleteVoting({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return { message };
  }
}
