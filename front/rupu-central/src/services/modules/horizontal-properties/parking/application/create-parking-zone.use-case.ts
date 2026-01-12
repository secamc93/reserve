import { IParkingRepository, ParkingZone, CreateParkingZoneDTO } from '../domain';

export class CreateParkingZoneUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(businessId: number, token: string, data: CreateParkingZoneDTO): Promise<ParkingZone> {
    return await this.repository.createParkingZone({ businessId, token, data });
  }
}
