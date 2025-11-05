import { IVotingsRepository, GetVotingByIdParams } from '../../domain/ports';
import { Voting } from '../../domain/entities';

export interface GetVotingByIdInput extends GetVotingByIdParams {
  id: number;
  token: string;
}

export interface GetVotingByIdOutput {
  voting: Voting;
}

export class GetVotingByIdUseCase {
  constructor(private votingsRepository: IVotingsRepository) {}

  async execute(input: GetVotingByIdInput): Promise<GetVotingByIdOutput> {
    const voting = await this.votingsRepository.getVotingById(input);
    return { voting };
  }
}
