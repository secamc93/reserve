import { IResidentsRepository, GetResidentsParams, ResidentsPaginated } from '../../domain';

export class GetResidentsUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: GetResidentsParams): Promise<ResidentsPaginated> {
    return await this.repository.getResidents(params);
  }
}
