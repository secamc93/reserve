'use server';

import { ParkingRepository } from '../repositories';
import { CheckParkingAvailabilityUseCase } from '../../application/check-parking-availability.use-case';
import { CheckParkingAvailabilityDTO } from '../../domain';

export async function checkParkingAvailabilityAction(
  token: string,
  data: CheckParkingAvailabilityDTO
): Promise<{ available: boolean; message?: string }> {
  const repository = new ParkingRepository();
  const useCase = new CheckParkingAvailabilityUseCase(repository);
  return await useCase.execute(token, data);
}
