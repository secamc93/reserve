import { IResidentsRepository, DeleteResidentParams } from '../../domain';

export class DeleteResidentUseCase {
  constructor(private repository: IResidentsRepository) {}

  async execute(params: DeleteResidentParams): Promise<void> {
    return await this.repository.deleteResident(params);
  }
}
