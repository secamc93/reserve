'use server';

import { ParkingRepository } from '../repositories';
import { GetParkingReservationsUseCase } from '../../application/get-parking-reservations.use-case';
import { GetParkingReservationsParams, ParkingReservationsPaginated } from '../../domain';

export async function getParkingReservationsAction(params: GetParkingReservationsParams): Promise<ParkingReservationsPaginated> {
  const repository = new ParkingRepository();
  const useCase = new GetParkingReservationsUseCase(repository);
  return await useCase.execute(params);
}
