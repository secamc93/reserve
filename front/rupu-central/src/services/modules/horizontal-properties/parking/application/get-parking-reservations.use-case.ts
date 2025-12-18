import { IParkingRepository, GetParkingReservationsParams, ParkingReservationsPaginated } from '../domain';

export class GetParkingReservationsUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(params: GetParkingReservationsParams): Promise<ParkingReservationsPaginated> {
    return await this.repository.getParkingReservations(params);
  }
}
