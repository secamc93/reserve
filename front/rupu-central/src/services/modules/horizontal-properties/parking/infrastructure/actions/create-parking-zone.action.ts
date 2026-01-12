'use server';

import { ParkingRepository } from '../repositories';
import { CreateParkingZoneUseCase } from '../../application/create-parking-zone.use-case';
import { ParkingZone, CreateParkingZoneDTO } from '../../domain';

export async function createParkingZoneAction(businessId: number, token: string, data: CreateParkingZoneDTO): Promise<ParkingZone> {
  const repository = new ParkingRepository();
  const useCase = new CreateParkingZoneUseCase(repository);
  return await useCase.execute(businessId, token, data);
}
