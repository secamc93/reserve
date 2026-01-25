/**
 * Use Case: Actualizar grupo de votación
 */

import { IVotingGroupsRepository } from '../domain/ports/voting-groups.repository';
import { VotingGroup, UpdateVotingGroupDTO } from '../domain/entities/voting-group.entity';
import { validateUpdateVotingGroup } from '../domain/validation/voting-validation';

export interface UpdateVotingGroupParams {
  token: string;
  businessId: number;
  groupId: number;
  data: UpdateVotingGroupDTO;
}

export interface UpdateVotingGroupResult {
  group: VotingGroup;
}

export type UpdateVotingGroupInput = UpdateVotingGroupParams;

export class UpdateVotingGroupUseCase {
  constructor(private repository: IVotingGroupsRepository) {}

  async execute(input: UpdateVotingGroupInput): Promise<UpdateVotingGroupResult> {
    // Validar datos de entrada
    validateUpdateVotingGroup(input.data);

    // Actualizar grupo de votación
    const group = await this.repository.updateVotingGroup({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      data: input.data,
    });

    return { group };
  }
}
