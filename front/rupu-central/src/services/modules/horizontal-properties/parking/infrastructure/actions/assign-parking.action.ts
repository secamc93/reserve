'use server';

import { ParkingRepository } from '../repositories';
import { AssignParkingUseCase } from '../../application/assign-parking.use-case';
import { ParkingAssignment, AssignParkingDTO } from '../../domain';

export async function assignParkingAction(businessId: number, data: AssignParkingDTO): Promise<ParkingAssignment> {
  const repository = new ParkingRepository();
  const useCase = new AssignParkingUseCase(repository);
  return await useCase.execute(businessId, data);
}
