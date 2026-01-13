'use server';

import { ParkingRepository } from '../repositories';
import { CreateParkingReservationUseCase } from '../../application/create-parking-reservation.use-case';
import { ParkingReservation, CreateParkingReservationDTO } from '../../domain';

export async function createParkingReservationAction(
  businessId: number,
  token: string,
  data: CreateParkingReservationDTO
): Promise<ParkingReservation> {
  const repository = new ParkingRepository();
  const useCase = new CreateParkingReservationUseCase(repository);
  return await useCase.execute(businessId, token, data);
}
