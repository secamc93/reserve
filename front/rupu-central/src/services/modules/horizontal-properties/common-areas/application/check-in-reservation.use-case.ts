import { ICommonAreasRepository, CheckInReservationParams, CommonAreaReservation } from '../domain';

export class CheckInReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: CheckInReservationParams): Promise<CommonAreaReservation> {
    return await this.repository.checkInReservation(params);
  }
}
