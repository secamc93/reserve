import { IParkingRepository, ParkingReservation, CreateParkingReservationDTO } from '../domain';

export class CreateParkingReservationUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(businessId: number, data: CreateParkingReservationDTO): Promise<ParkingReservation> {
    return await this.repository.createParkingReservation({ businessId, data });
  }
}
