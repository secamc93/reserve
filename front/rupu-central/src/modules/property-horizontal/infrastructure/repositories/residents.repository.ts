/**
 * Implementación del repositorio de Residents
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IResidentsRepository,
  GetResidentsParams,
  GetResidentByIdParams,
  CreateResidentParams,
  UpdateResidentParams,
  DeleteResidentParams,
  BulkUpdateResidentsParams,
  BulkUpdateResidentsResponse,
  Resident,
  ResidentsPaginated,
} from '../../domain';
import {
  BackendGetResidentsResponse,
  BackendGetResidentByIdResponse,
  BackendCreateResidentResponse,
  BackendUpdateResidentResponse,
  BackendDeleteResidentResponse,
  BackendResident,
  BackendResidentListItem,
} from './response';

export class ResidentsRepository implements IResidentsRepository {
  private baseUrl = env.API_BASE_URL;

  // Mapear listado resumido (solo campos básicos)
  private mapBackendResidentListItem(resident: BackendResidentListItem): Resident {
    return {
      id: resident.id,
      businessId: 0, // No viene en el listado
      propertyUnitId: 0, // No viene en el listado
      propertyUnitNumber: resident.property_unit_number,
      residentTypeId: 0, // No viene en el listado
      residentTypeName: resident.resident_type_name,
      residentTypeCode: '', // No viene en el listado
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      dni: '', // No viene en el listado
      emergencyContact: '', // No viene en el listado
      isMainResident: resident.is_main_resident,
      isActive: resident.is_active,
      moveInDate: undefined,
      moveOutDate: undefined,
      leaseStartDate: undefined,
      leaseEndDate: undefined,
      monthlyRent: undefined,
      createdAt: '',
      updatedAt: '',
    };
  }

  // Mapear detalle completo
  private mapBackendResident(resident: BackendResident): Resident {
    return {
      id: resident.id,
      businessId: resident.business_id,
      propertyUnitId: resident.property_unit_id,
      propertyUnitNumber: resident.property_unit_number,
      residentTypeId: resident.resident_type_id,
      residentTypeName: resident.resident_type_name,
      residentTypeCode: resident.resident_type_code,
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      dni: resident.dni,
      emergencyContact: resident.emergency_contact,
      isMainResident: resident.is_main_resident,
      isActive: resident.is_active,
      moveInDate: resident.move_in_date,
      moveOutDate: resident.move_out_date,
      leaseStartDate: resident.lease_start_date,
      leaseEndDate: resident.lease_end_date,
      monthlyRent: resident.monthly_rent,
      createdAt: resident.created_at,
      updatedAt: resident.updated_at,
    };
  }

  async getResidents(params: GetResidentsParams): Promise<ResidentsPaginated> {
    const { hpId, token, page = 1, pageSize = 10, name, propertyUnitId, propertyUnitNumber, residentTypeId, isActive, isMainResident, dni } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (name !== undefined) queryParams.append('name', name);
    if (propertyUnitId !== undefined) queryParams.append('property_unit_id', propertyUnitId.toString());
    if (propertyUnitNumber !== undefined) queryParams.append('property_unit_number', propertyUnitNumber);
    if (residentTypeId !== undefined) queryParams.append('resident_type_id', residentTypeId.toString());
    if (isActive !== undefined) queryParams.append('is_active', isActive.toString());
    if (isMainResident !== undefined) queryParams.append('is_main_resident', isMainResident.toString());
    if (dni !== undefined) queryParams.append('dni', dni);

    // Nueva URL: listar residentes por business (hp)
    if (hpId !== undefined) queryParams.append('business_id', hpId.toString());
    const url = `${this.baseUrl}/horizontal-properties/residents?${queryParams.toString()}`;
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
      const data: BackendGetResidentsResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener los residentes');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        residents: data.data.residents.map(this.mapBackendResidentListItem.bind(this)),
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

  async getResidentById(params: GetResidentByIdParams): Promise<Resident> {
    const { hpId, residentId, token } = params;
    // Nueva URL: detalle de residente con business_id opcional en query
    const url = `${this.baseUrl}/horizontal-properties/residents/${residentId}${hpId !== undefined ? `?business_id=${hpId}` : ''}`;
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
      const data: BackendGetResidentByIdResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener el residente');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendResident(data.data);
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

  async createResident(params: CreateResidentParams): Promise<Resident> {
    const { hpId, data: residentData, token } = params;
    // Nueva URL: sin business_id en path, se envía en el body
    const url = `${this.baseUrl}/horizontal-properties/residents`;
    const method = 'POST';
    const startTime = Date.now();

    const body = {
      business_id: hpId,
      property_unit_id: residentData.propertyUnitId,
      resident_type_id: residentData.residentTypeId,
      name: residentData.name,
      email: residentData.email,
      phone: residentData.phone,
      dni: residentData.dni,
      emergency_contact: residentData.emergencyContact,
      is_main_resident: residentData.isMainResident,
      move_in_date: residentData.moveInDate,
      lease_start_date: residentData.leaseStartDate,
      lease_end_date: residentData.leaseEndDate,
      monthly_rent: residentData.monthlyRent,
    };

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
      const data: BackendCreateResidentResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al crear el residente');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendResident(data.data);
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

  async updateResident(params: UpdateResidentParams): Promise<Resident> {
    const { hpId, residentId, data: residentData, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/${hpId}/residents/${residentId}`;
    const method = 'PUT';
    const startTime = Date.now();

    const body: Record<string, unknown> = {};
    if (residentData.propertyUnitId !== undefined) body.property_unit_id = residentData.propertyUnitId;
    if (residentData.residentTypeId !== undefined) body.resident_type_id = residentData.residentTypeId;
    if (residentData.name !== undefined) body.name = residentData.name;
    if (residentData.email !== undefined) body.email = residentData.email;
    if (residentData.phone !== undefined) body.phone = residentData.phone;
    if (residentData.dni !== undefined) body.dni = residentData.dni;
    if (residentData.emergencyContact !== undefined) body.emergency_contact = residentData.emergencyContact;
    if (residentData.isMainResident !== undefined) body.is_main_resident = residentData.isMainResident;
    if (residentData.isActive !== undefined) body.is_active = residentData.isActive;
    if (residentData.moveInDate !== undefined) body.move_in_date = residentData.moveInDate;
    if (residentData.moveOutDate !== undefined) body.move_out_date = residentData.moveOutDate;
    if (residentData.leaseStartDate !== undefined) body.lease_start_date = residentData.leaseStartDate;
    if (residentData.leaseEndDate !== undefined) body.lease_end_date = residentData.leaseEndDate;
    if (residentData.monthlyRent !== undefined) body.monthly_rent = residentData.monthlyRent;

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
      const data: BackendUpdateResidentResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al actualizar el residente');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendResident(data.data);
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

  async deleteResident(params: DeleteResidentParams): Promise<void> {
    const { hpId, residentId, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/${hpId}/residents/${residentId}`;
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
      const data: BackendDeleteResidentResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al eliminar el residente');
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

  async bulkUpdateResidents(params: BulkUpdateResidentsParams): Promise<BulkUpdateResidentsResponse> {
    const { hpId, file, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/${hpId}/residents/bulk-update`;
    const startTime = Date.now();

    const formData = new FormData();
    formData.append('file', file);

    logHttpRequest({
      method: 'PUT',
      url,
      token,
      body: `FormData con archivo Excel: ${file.name}`,
    });

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const duration = Date.now() - startTime;
      const backendResponse: {
        success: boolean;
        message: string;
        data: {
          total_processed: number;
          updated: number;
          errors: number;
          error_details: Array<{
            row: number;
            property_unit_number: string;
            error: string;
          }>;
        };
      } = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error en edición masiva: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Edición masiva completada: ${backendResponse.data.updated} actualizados, ${backendResponse.data.errors} errores`,
        data: backendResponse,
      });

      return backendResponse;
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
}
