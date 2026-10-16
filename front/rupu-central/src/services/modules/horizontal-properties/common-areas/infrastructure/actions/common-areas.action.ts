'use server';

/** Server Actions de zonas comunes: listar, crear, editar, eliminar, horario y bloqueos. */

import { revalidatePath } from 'next/cache';
import { CommonAreasRepository } from '../repositories';
import {
  CreateCommonAreaUseCase,
  GetCommonAreasUseCase,
  GetCommonAreaByIdUseCase,
  GetCommonAreaTypesUseCase,
  UpdateCommonAreaUseCase,
  DeleteCommonAreaUseCase,
  GetSchedulesUseCase,
  SetSchedulesUseCase,
  GetRestrictionsUseCase,
  CreateRestrictionUseCase,
  DeleteRestrictionUseCase,
  SearchUnitsUseCase,
} from '../../application';
import type {
  GetCommonAreasParams,
  GetCommonAreaByIdParams,
  CreateCommonAreaParams,
  UpdateCommonAreaParams,
  DeleteCommonAreaParams,
  SetSchedulesParams,
  CreateRestrictionParams,
  DeleteRestrictionParams,
  SearchUnitsParams,
  CommonArea,
  CommonAreasPaginated,
  CommonAreaType,
  CommonAreaSchedule,
  CommonAreaRestriction,
  UnitLookup,
} from '../../domain';
import { toResult, type ActionResult } from './result';

const repo = () => new CommonAreasRepository();
const revalidate = (businessId: number) => revalidatePath(`/properties/${businessId}/common-areas`);

export async function getCommonAreasAction(params: GetCommonAreasParams): Promise<ActionResult<CommonAreasPaginated>> {
  return toResult(() => new GetCommonAreasUseCase(repo()).execute(params), 'Error cargando zonas comunes');
}

export async function getCommonAreaByIdAction(params: GetCommonAreaByIdParams): Promise<ActionResult<CommonArea>> {
  return toResult(() => new GetCommonAreaByIdUseCase(repo()).execute(params), 'Error cargando la zona');
}

export async function getCommonAreaTypesAction(token: string): Promise<ActionResult<CommonAreaType[]>> {
  return toResult(() => new GetCommonAreaTypesUseCase(repo()).execute(token), 'Error cargando tipos de zona');
}

export async function createCommonAreaAction(params: CreateCommonAreaParams): Promise<ActionResult<CommonArea>> {
  const result = await toResult(() => new CreateCommonAreaUseCase(repo()).execute(params), 'Error creando la zona');
  if (result.success) revalidate(params.businessId);
  return result;
}

export async function updateCommonAreaAction(params: UpdateCommonAreaParams): Promise<ActionResult<CommonArea>> {
  const result = await toResult(() => new UpdateCommonAreaUseCase(repo()).execute(params), 'Error guardando la zona');
  if (result.success) revalidate(params.businessId);
  return result;
}

export async function deleteCommonAreaAction(params: DeleteCommonAreaParams): Promise<ActionResult<null>> {
  const result = await toResult(async () => {
    await new DeleteCommonAreaUseCase(repo()).execute(params);
    return null;
  }, 'Error eliminando la zona');
  if (result.success) revalidate(params.businessId);
  return result;
}

export async function getSchedulesAction(params: GetCommonAreaByIdParams): Promise<ActionResult<CommonAreaSchedule[]>> {
  return toResult(() => new GetSchedulesUseCase(repo()).execute(params), 'Error cargando el horario');
}

export async function setSchedulesAction(params: SetSchedulesParams): Promise<ActionResult<CommonAreaSchedule[]>> {
  const result = await toResult(() => new SetSchedulesUseCase(repo()).execute(params), 'Error guardando el horario');
  if (result.success) revalidate(params.businessId);
  return result;
}

export async function getRestrictionsAction(params: GetCommonAreaByIdParams): Promise<ActionResult<CommonAreaRestriction[]>> {
  return toResult(() => new GetRestrictionsUseCase(repo()).execute(params), 'Error cargando los bloqueos');
}

export async function createRestrictionAction(params: CreateRestrictionParams): Promise<ActionResult<CommonAreaRestriction>> {
  return toResult(() => new CreateRestrictionUseCase(repo()).execute(params), 'Error creando el bloqueo');
}

export async function deleteRestrictionAction(params: DeleteRestrictionParams): Promise<ActionResult<null>> {
  return toResult(async () => {
    await new DeleteRestrictionUseCase(repo()).execute(params);
    return null;
  }, 'Error eliminando el bloqueo');
}

export async function searchUnitsAction(params: SearchUnitsParams): Promise<ActionResult<UnitLookup[]>> {
  return toResult(() => new SearchUnitsUseCase(repo()).execute(params), 'Error buscando unidades');
}
