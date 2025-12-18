'use server';

import { ParkingRepository } from '../repositories';
import { GetParkingAssignmentsUseCase } from '../../application/get-parking-assignments.use-case';
import { GetParkingAssignmentsParams, ParkingAssignmentsPaginated } from '../../domain';

export async function getParkingAssignmentsAction(params: GetParkingAssignmentsParams): Promise<ParkingAssignmentsPaginated> {
  const repository = new ParkingRepository();
  const useCase = new GetParkingAssignmentsUseCase(repository);
  return await useCase.execute(params);
}
