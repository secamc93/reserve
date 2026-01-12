import { ICommonAreasRepository, CheckAvailabilityParams } from '../domain';

export class CheckAvailabilityUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: CheckAvailabilityParams): Promise<{ available: boolean; message?: string }> {
    return await this.repository.checkAvailability(params);
  }
}
