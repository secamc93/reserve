'use server';

import { ParkingRepository } from '../repositories';
import { GetParkingTypesUseCase } from '../../application/get-parking-types.use-case';
import { ParkingType } from '../../domain';

export async function getParkingTypesAction(token: string): Promise<ParkingType[]> {
  const repository = new ParkingRepository();
  const useCase = new GetParkingTypesUseCase(repository);
  return await useCase.execute(token);
}
