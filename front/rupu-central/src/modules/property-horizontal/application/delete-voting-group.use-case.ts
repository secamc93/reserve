/**
 * Use Case: Eliminar/Desactivar grupo de votación
 */

import { VotingGroupsRepository } from '../infrastructure/repositories/voting-groups.repository';

export interface DeleteVotingGroupParams {
  token: string;
  hpId: number;
  groupId: number;
}

export interface DeleteVotingGroupResult {
  message: string;
}

export type DeleteVotingGroupInput = DeleteVotingGroupParams;

export class DeleteVotingGroupUseCase {
  constructor(private repository: VotingGroupsRepository) {}

  async execute(input: DeleteVotingGroupInput): Promise<DeleteVotingGroupResult> {
    // Validar que el ID del grupo sea válido
    if (!input.groupId || input.groupId <= 0) {
      throw new Error('ID del grupo de votación inválido');
    }

    // Eliminar/desactivar grupo de votación
    const message = await this.repository.deleteVotingGroup({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
    });

    return { message };
  }
}
