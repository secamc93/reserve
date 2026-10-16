/**
 * Casos de uso: activos declarados de una visita y vehículo del visitante.
 */

import { IVisitsRepository, GetVisitAssetsParams, CreateVisitorVehicleParams, VisitAssetItem, VisitorVehicle } from '../domain';

export class GetVisitAssetsUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetVisitAssetsParams): Promise<VisitAssetItem[]> {
    return await this.repository.getVisitAssets(params);
  }
}

export class CreateVisitorVehicleUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: CreateVisitorVehicleParams): Promise<VisitorVehicle> {
    return await this.repository.createVisitorVehicle(params);
  }
}
