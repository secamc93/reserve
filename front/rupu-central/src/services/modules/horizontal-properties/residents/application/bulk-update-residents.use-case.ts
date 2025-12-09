import { IResidentsRepository, BulkUpdateResidentsParams, BulkUpdateResidentsResponse } from '../domain/ports';

export class BulkUpdateResidentsUseCase {
  constructor(private residentsRepository: IResidentsRepository) {}

  async execute(input: BulkUpdateResidentsParams): Promise<BulkUpdateResidentsResponse> {
    return this.residentsRepository.bulkUpdateResidents(input);
  }
}
