import { IParkingRepository, GetParkingAssignmentsParams, ParkingAssignmentsPaginated } from '../domain';

export class GetParkingAssignmentsUseCase {
  constructor(private repository: IParkingRepository) {}

  async execute(params: GetParkingAssignmentsParams): Promise<ParkingAssignmentsPaginated> {
    return await this.repository.getParkingAssignments(params);
  }
}
