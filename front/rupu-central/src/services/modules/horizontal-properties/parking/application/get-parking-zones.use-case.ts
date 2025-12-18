import { IParkingRepository, GetParkingZonesParams, ParkingZonesPaginated } from '../domain';

export class GetParkingZonesUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(params: GetParkingZonesParams): Promise<ParkingZonesPaginated> {
    return await this.repository.getParkingZones(params);
  }
}
