/**
 * Use Case: Actualizar votación
 */

import { IVotingsRepository, UpdateVotingParams } from '../domain/ports';
import { Voting } from '../domain/entities';
import { validateUpdateVoting } from '../domain/validation/voting-validation';

export interface UpdateVotingInput extends UpdateVotingParams {}

export interface UpdateVotingOutput {
  voting: Voting;
}

export class UpdateVotingUseCase {
  constructor(private votingsRepository: IVotingsRepository) {}

  async execute(input: UpdateVotingInput): Promise<UpdateVotingOutput> {
    // Validar que el ID de la votación sea válido
    if (!input.votingId || input.votingId <= 0) {
      throw new Error('ID de la votación inválido');
    }

    // Validar los datos de entrada
    if (input.data) {
      validateUpdateVoting(input.data);
    }

    // Actualizar votación
    const voting = await this.votingsRepository.updateVoting({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
      votingId: input.votingId,
      data: input.data,
    });

    return { voting };
  }
}
