/**
 * Use Case: Actualizar grupo de votación
 */

import { VotingGroupsRepository } from '../../infrastructure/repositories/voting-groups.repository';
import { VotingGroup, UpdateVotingGroupDTO } from '../../domain/entities';
import { validateUpdateVotingGroup } from '../../domain/validation/voting-validation';

export interface UpdateVotingGroupParams {
  token: string;
  hpId: number;
  groupId: number;
  data: UpdateVotingGroupDTO;
}

export interface UpdateVotingGroupResult {
  group: VotingGroup;
}

export type UpdateVotingGroupInput = UpdateVotingGroupParams;

export class UpdateVotingGroupUseCase {
  constructor(private repository: VotingGroupsRepository) {}

  async execute(input: UpdateVotingGroupInput): Promise<UpdateVotingGroupResult> {
    // Validar datos de entrada
    validateUpdateVotingGroup(input.data);

    // Actualizar grupo de votación
    const group = await this.repository.updateVotingGroup({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
      data: input.data,
    });

    return { group };
  }
}
