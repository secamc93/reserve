import { IResidentsRepository, CreateResidentParams, Resident } from '../../domain';

export class CreateResidentUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: CreateResidentParams): Promise<Resident> {
    return await this.repository.createResident(params);
  }
}
