import { ICommonAreasRepository, CancelReservationParams, CommonAreaReservation } from '../domain';

export class CancelReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: CancelReservationParams): Promise<CommonAreaReservation> {
    return await this.repository.cancelReservation(params);
  }
}
