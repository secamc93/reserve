import { IResidentsRepository, GetResidentByIdParams, ResidentOverview } from '../domain';

export class GetResidentOverviewUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: GetResidentByIdParams): Promise<ResidentOverview> {
    return await this.repository.getResidentOverview(params);
  }
}
