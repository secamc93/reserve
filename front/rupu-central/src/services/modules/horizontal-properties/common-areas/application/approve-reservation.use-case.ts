import { ICommonAreasRepository, ApproveReservationParams, CommonAreaReservation } from '../domain';

export class ApproveReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: ApproveReservationParams): Promise<CommonAreaReservation> {
    return await this.repository.approveReservation(params);
  }
}
