import { IParkingRepository, CheckParkingAvailabilityDTO } from '../domain';

export class CheckParkingAvailabilityUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(token: string, data: CheckParkingAvailabilityDTO): Promise<{ available: boolean; message?: string }> {
    return await this.repository.checkParkingAvailability({ token, data });
  }
}
