'use server';

import { ParkingRepository } from '../repositories';
import { CreateParkingSlotUseCase } from '../../application/create-parking-slot.use-case';
import { ParkingSlot, CreateParkingSlotDTO } from '../../domain';

export async function createParkingSlotAction(token: string, data: CreateParkingSlotDTO): Promise<ParkingSlot> {
  const repository = new ParkingRepository();
  const useCase = new CreateParkingSlotUseCase(repository);
  return await useCase.execute(token, data);
}
