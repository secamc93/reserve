import { IResidentsRepository, GetResidentsSummaryParams, ResidentsSummary } from '../domain';

export class GetResidentsSummaryUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: GetResidentsSummaryParams): Promise<ResidentsSummary> {
    return await this.repository.getResidentsSummary(params);
  }
}
