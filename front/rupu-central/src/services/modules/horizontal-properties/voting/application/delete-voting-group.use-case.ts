/**
 * Use Case: Eliminar/Desactivar grupo de votación
 */

import { IVotingGroupsRepository } from '../domain/ports/voting-groups.repository';

export interface DeleteVotingGroupParams {
  token: string;
  businessId: number;
  groupId: number;
}

export interface DeleteVotingGroupResult {
  message: string;
}

export type DeleteVotingGroupInput = DeleteVotingGroupParams;

export class DeleteVotingGroupUseCase {
  constructor(private repository: IVotingGroupsRepository) {}

  async execute(input: DeleteVotingGroupInput): Promise<DeleteVotingGroupResult> {
    // Validar que el ID del grupo sea válido
    if (!input.groupId || input.groupId <= 0) {
      throw new Error('ID del grupo de votación inválido');
    }

    // Eliminar/desactivar grupo de votación
    const message = await this.repository.deleteVotingGroup({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
    });

    return { message };
  }
}
