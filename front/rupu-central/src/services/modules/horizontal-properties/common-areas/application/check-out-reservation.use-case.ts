import { ICommonAreasRepository, CheckOutReservationParams, CommonAreaReservation } from '../domain';

export class CheckOutReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: CheckOutReservationParams): Promise<CommonAreaReservation> {
    return await this.repository.checkOutReservation(params);
  }
}
