import { IParkingRepository, ParkingAssignment, AssignParkingDTO } from '../domain';

export class AssignParkingUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(businessId: number, token: string, data: AssignParkingDTO): Promise<ParkingAssignment> {
    return await this.repository.assignParking({ businessId, token, data });
  }
}
