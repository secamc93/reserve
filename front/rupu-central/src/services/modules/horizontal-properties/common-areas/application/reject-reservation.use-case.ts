import { ICommonAreasRepository, RejectReservationParams, CommonAreaReservation } from '../domain';

export class RejectReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: RejectReservationParams): Promise<CommonAreaReservation> {
    return await this.repository.rejectReservation(params);
  }
}
