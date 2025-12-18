'use server';

import { ParkingRepository } from '../repositories';
import { GetParkingZonesUseCase } from '../../application/get-parking-zones.use-case';
import { GetParkingZonesParams, ParkingZonesPaginated } from '../../domain';

export async function getParkingZonesAction(params: GetParkingZonesParams): Promise<ParkingZonesPaginated> {
  const repository = new ParkingRepository();
  const useCase = new GetParkingZonesUseCase(repository);
  return await useCase.execute(params);
}
