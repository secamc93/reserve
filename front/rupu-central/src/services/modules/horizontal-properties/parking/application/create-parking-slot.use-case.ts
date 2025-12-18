import { IParkingRepository, ParkingSlot, CreateParkingSlotDTO } from '../domain';

export class CreateParkingSlotUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(data: CreateParkingSlotDTO): Promise<ParkingSlot> {
    return await this.repository.createParkingSlot({ data });
  }
}
