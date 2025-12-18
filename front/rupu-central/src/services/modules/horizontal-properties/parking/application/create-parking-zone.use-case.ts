import { IParkingRepository, ParkingZone, CreateParkingZoneDTO } from '../domain';

export class CreateParkingZoneUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(businessId: number, data: CreateParkingZoneDTO): Promise<ParkingZone> {
    return await this.repository.createParkingZone({ businessId, data });
  }
}
