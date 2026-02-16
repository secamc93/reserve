/**
 * Caso de uso: Votación masiva
 */

import {
  IVotesRepository,
  CreateBulkVotesParams,
} from '../domain/ports';
import { BulkVoteResult } from '../domain/entities';

export interface CreateBulkVotesOutput {
  result: BulkVoteResult;
}

export class CreateBulkVotesUseCase {
  constructor(private votesRepository: IVotesRepository) {}

  async execute(params: CreateBulkVotesParams): Promise<CreateBulkVotesOutput> {
    const result = await this.votesRepository.createBulkVotes(params);
    return { result };
  }
}
