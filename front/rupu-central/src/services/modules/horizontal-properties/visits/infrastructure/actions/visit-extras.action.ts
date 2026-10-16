'use server';

import { VisitsRepository } from '../repositories';
import { CreateVisitorVehicleUseCase, GetVisitAssetsUseCase } from '../../application';
import { CreateVisitorVehicleParams, GetVisitAssetsParams, VisitAssetItem, VisitorVehicle } from '../../domain';

export async function getVisitAssetsAction(params: GetVisitAssetsParams): Promise<VisitAssetItem[]> {
  return await new GetVisitAssetsUseCase(new VisitsRepository()).execute(params);
}

export async function createVisitorVehicleAction(params: CreateVisitorVehicleParams): Promise<VisitorVehicle> {
  return await new CreateVisitorVehicleUseCase(new VisitsRepository()).execute(params);
}
