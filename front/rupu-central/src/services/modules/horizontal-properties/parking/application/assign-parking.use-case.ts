import { IParkingRepository, ParkingAssignment, AssignParkingDTO } from '../domain';

export class AssignParkingUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(businessId: number, data: AssignParkingDTO): Promise<ParkingAssignment> {
    return await this.repository.assignParking({ businessId, data });
  }
}
