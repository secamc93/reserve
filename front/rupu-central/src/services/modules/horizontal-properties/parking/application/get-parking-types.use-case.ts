/**
 * UseCase: GetParkingTypesUseCase
 * Obtiene todos los tipos de parqueadero activos
 */

import { ParkingType } from '../domain/entities';
import { IParkingRepository } from '../domain/ports/parking.repository';

export class GetParkingTypesUseCase {
  constructor(private readonly repository: IParkingRepository) {}

  async execute(token: string): Promise<ParkingType[]> {
    return await this.repository.getParkingTypes(token);
  }
}
