import { IParkingRepository, GetParkingSlotsParams, ParkingSlotsPaginated } from '../domain';

export class GetParkingSlotsUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(params: GetParkingSlotsParams): Promise<ParkingSlotsPaginated> {
    return await this.repository.getParkingSlots(params);
  }
}
