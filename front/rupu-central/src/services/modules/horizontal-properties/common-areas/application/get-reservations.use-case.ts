import { ICommonAreasRepository, GetReservationsParams, ReservationsPaginated } from '../domain';

export class GetReservationsUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: GetReservationsParams): Promise<ReservationsPaginated> {
    return await this.repository.getReservations(params);
  }
}
