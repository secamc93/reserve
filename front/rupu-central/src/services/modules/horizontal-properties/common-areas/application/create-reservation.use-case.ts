import { ICommonAreasRepository, CreateReservationParams, CommonAreaReservation } from '../domain';

export class CreateReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}

  async execute(params: CreateReservationParams): Promise<CommonAreaReservation> {
    return await this.repository.createReservation(params);
  }
}
