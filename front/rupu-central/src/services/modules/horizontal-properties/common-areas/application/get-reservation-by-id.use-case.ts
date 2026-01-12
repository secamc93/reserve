import { ICommonAreasRepository, GetReservationByIdParams, CommonAreaReservation } from '../domain';

export class GetReservationByIdUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: GetReservationByIdParams): Promise<CommonAreaReservation> {
    return await this.repository.getReservationById(params);
  }
}
