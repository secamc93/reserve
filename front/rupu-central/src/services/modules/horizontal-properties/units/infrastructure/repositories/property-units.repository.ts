/**
 * Implementación del repositorio de Property Units
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IPropertyUnitsRepository,
  GetPropertyUnitsParams,
  GetPropertyUnitByIdParams,
  CreatePropertyUnitParams,
  UpdatePropertyUnitParams,
  DeletePropertyUnitParams,
  GetPropertyUnitsSummaryParams,
  PropertyUnit,
  PropertyUnitsPaginated,
  PropertyUnitsSummary,
} from '../../domain';
import {
  BackendGetPropertyUnitsResponse,
  BackendGetPropertyUnitByIdResponse,
  BackendCreatePropertyUnitResponse,
  BackendUpdatePropertyUnitResponse,
  BackendDeletePropertyUnitResponse,
  BackendPropertyUnit,
  BackendPropertyUnitsSummaryResponse,
} from './response/property-units.response';

/** Convierte la respuesta del resumen del back al dominio. */
export function mapBackendPropertyUnitsSummary(data: BackendPropertyUnitsSummaryResponse['data']): PropertyUnitsSummary {
  return {
    total: data.total ?? 0,
    active: data.active ?? 0,
    withResidents: data.with_residents ?? 0,
    coefficientSum: data.coefficient_sum ?? 0,
    commercial: data.commercial ?? 0,
    blocks: (data.blocks ?? []).map((b) => ({
      block: b.block ?? '',
      total: b.total ?? 0,
      active: b.active ?? 0,
      coefficientSum: b.coefficient_sum ?? 0,
    })),
  };
}

export class PropertyUnitsRepository implements IPropertyUnitsRepository {
  private baseUrl = env.API_BASE_URL;

  private mapBackendPropertyUnit(unit: BackendPropertyUnit): PropertyUnit {
    return {
      id: unit.id,
      businessId: unit.business_id,
      number: unit.number,
      floor: unit.floor,
      block: unit.block,
      unitType: unit.unit_type,
      area: unit.area,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      coefficient: unit.participation_coefficient,
      description: unit.description,
      isActive: unit.is_active,
      createdAt: unit.created_at,
      updatedAt: unit.updated_at,
      residentsCount: unit.residents_count,
      mainResidentName: unit.main_resident_name || undefined,
    };
  }

  async getPropertyUnits(params: GetPropertyUnitsParams): Promise<PropertyUnitsPaginated> {
    const { businessId, token, page = 1, pageSize = 10, number, unitType, floor, block, isActive, query, withoutResidents, groupByBlock } = params;

    if (businessId == null) {
      throw new Error('businessId es requerido para listar las unidades');
    }

    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());
    queryParams.set('business_id', businessId.toString());

    if (number) {
      queryParams.append('number', number);
      // Compatibilidad: algunos entornos aún esperan property_unit_number
      queryParams.append('property_unit_number', number);
    }
    if (unitType) queryParams.append('unit_type', unitType);
    if (floor !== undefined) queryParams.append('floor', floor.toString());
    if (block) queryParams.append('block', block);
    if (isActive !== undefined) queryParams.append('is_active', isActive.toString());
    if (query) queryParams.append('q', query);
    if (withoutResidents !== undefined) queryParams.append('without_residents', withoutResidents.toString());
    if (groupByBlock) queryParams.append('group_by_block', 'true');

    // URL correcta para listar unidades (con business_id como query param)
    const url = `${this.baseUrl}/horizontal-properties/property-units?${queryParams.toString()}`;

    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const data: BackendGetPropertyUnitsResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener las unidades');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        units: data.data.units.map(this.mapBackendPropertyUnit),
        total: data.data.total,
        page: data.data.page,
        pageSize: data.data.page_size,
        totalPages: data.data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async getPropertyUnitById(params: GetPropertyUnitByIdParams): Promise<PropertyUnit> {
    const { businessId, unitId, token } = params;
    // URL correcta para obtener unidad por ID
    const url = `${this.baseUrl}/horizontal-properties/property-units/${unitId}?${
      businessId !== undefined ? `business_id=${businessId}` : ''
    }`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const data: BackendGetPropertyUnitByIdResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener la unidad');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPropertyUnit(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async createPropertyUnit(params: CreatePropertyUnitParams): Promise<PropertyUnit> {
    const { businessId, data: unitData, token } = params;
    // Nueva URL: sin business_id en path, se envía en el body
    const url = `${this.baseUrl}/horizontal-properties/property-units`;
    const method = 'POST';
    const startTime = Date.now();

    // Solo incluir campos requeridos y campos opcionales que estén definidos
    const body: Record<string, unknown> = {
      business_id: businessId,
      number: unitData.number,
      unit_type: unitData.unitType,
    };

    // Agregar campos opcionales solo si están definidos
    if (unitData.floor !== undefined) body.floor = unitData.floor;
    if (unitData.block !== undefined) body.block = unitData.block;
    if (unitData.area !== undefined) body.area = unitData.area;
    if (unitData.bedrooms !== undefined) body.bedrooms = unitData.bedrooms;
    if (unitData.bathrooms !== undefined) body.bathrooms = unitData.bathrooms;
    if (unitData.coefficient !== undefined) body.participation_coefficient = unitData.coefficient;
    if (unitData.description !== undefined) body.description = unitData.description;

    logHttpRequest({ method, url, body });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const data: BackendCreatePropertyUnitResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al crear la unidad');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPropertyUnit(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async updatePropertyUnit(params: UpdatePropertyUnitParams): Promise<PropertyUnit> {
    const { businessId, unitId, data: unitData, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/property-units/${unitId}`;
    const method = 'PUT';
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      business_id: businessId,
    };
    if (unitData.number !== undefined) body.number = unitData.number;
    if (unitData.floor !== undefined) body.floor = unitData.floor;
    if (unitData.block !== undefined) body.block = unitData.block;
    if (unitData.unitType !== undefined) body.unit_type = unitData.unitType;
    if (unitData.area !== undefined) body.area = unitData.area;
    if (unitData.bedrooms !== undefined) body.bedrooms = unitData.bedrooms;
    if (unitData.bathrooms !== undefined) body.bathrooms = unitData.bathrooms;
    if (unitData.coefficient !== undefined) body.participation_coefficient = unitData.coefficient;
    if (unitData.description !== undefined) body.description = unitData.description;
    if (unitData.isActive !== undefined) body.is_active = unitData.isActive;

    logHttpRequest({ method, url, body });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const data: BackendUpdatePropertyUnitResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al actualizar la unidad');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPropertyUnit(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async deletePropertyUnit(params: DeletePropertyUnitParams): Promise<void> {
    const { businessId, unitId, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/property-units/${unitId}?business_id=${businessId}`;
    const method = 'DELETE';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const data: BackendDeletePropertyUnitResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al eliminar la unidad');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async getPropertyUnitsSummary(params: GetPropertyUnitsSummaryParams): Promise<PropertyUnitsSummary> {
    const { businessId, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/property-units/summary?business_id=${businessId}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    const response = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const duration = Date.now() - startTime;
    const data: BackendPropertyUnitsSummaryResponse = await response.json();

    if (!response.ok) {
      logHttpError({ status: response.status, statusText: response.statusText, duration, data });
      throw new Error(data.message || 'Error al obtener el resumen de unidades');
    }
    logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
    return mapBackendPropertyUnitsSummary(data.data);
  }
}
