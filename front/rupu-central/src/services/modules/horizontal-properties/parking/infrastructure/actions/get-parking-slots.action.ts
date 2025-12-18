'use server';

import { ParkingRepository } from '../repositories';
import { GetParkingSlotsUseCase } from '../../application/get-parking-slots.use-case';
import { GetParkingSlotsParams, ParkingSlotsPaginated } from '../../domain';

export async function getParkingSlotsAction(params: GetParkingSlotsParams): Promise<ParkingSlotsPaginated> {
  const repository = new ParkingRepository();
  const useCase = new GetParkingSlotsUseCase(repository);
  return await useCase.execute(params);
}
