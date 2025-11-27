/**
 * Caso de uso: Actualizar estado de una opción de votación
 */

import {
  IVotingOptionsRepository,
  UpdateVotingOptionStatusParams,
} from '../../domain/ports';
import { VotingOption } from '../../domain/entities';

export interface UpdateVotingOptionStatusOutput {
  option: VotingOption;
}

export class UpdateVotingOptionStatusUseCase {
  constructor(private votingOptionsRepository: IVotingOptionsRepository) {}

  async execute(params: UpdateVotingOptionStatusParams): Promise<UpdateVotingOptionStatusOutput> {
    const option = await this.votingOptionsRepository.updateVotingOptionStatus(params);
    return { option };
  }
}


