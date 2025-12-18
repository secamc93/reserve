import { IParkingRepository, CheckParkingAvailabilityDTO } from '../domain';

export class CheckParkingAvailabilityUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(data: CheckParkingAvailabilityDTO): Promise<{ available: boolean; message?: string }> {
    return await this.repository.checkParkingAvailability({ data });
  }
}
