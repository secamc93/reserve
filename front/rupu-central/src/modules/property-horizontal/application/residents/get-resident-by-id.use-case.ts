import { IResidentsRepository, GetResidentByIdParams, Resident } from '../../domain';

export class GetResidentByIdUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: GetResidentByIdParams): Promise<Resident> {
    return await this.repository.getResidentById(params);
  }
}
