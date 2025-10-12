import { IResidentsRepository, UpdateResidentParams, Resident } from '../../domain';

export class UpdateResidentUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: UpdateResidentParams): Promise<Resident> {
    return await this.repository.updateResident(params);
  }
}
