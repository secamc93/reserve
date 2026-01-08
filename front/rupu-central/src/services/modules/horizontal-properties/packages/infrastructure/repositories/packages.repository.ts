/**
 * Implementación del repositorio de Paquetes
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IPackagesRepository,
  GetPackagesParams,
  GetPackageByIdParams,
  GetPackageByQRCodeParams,
  ReceivePackageParams,
  DeliverPackageParams,
  UpdatePackageStatusParams,
  GetPackageStatusesParams,
  DeletePackageParams,
  Package,
  PackageListDTO,
  PackagesPaginated,
  PackageStatus,
} from '../../domain';
import {
  BackendPackageResponse,
  BackendPackagesPaginatedResponse,
  BackendPackage,
  BackendPackageList,
} from './response/packages.response';

export class PackagesRepository implements IPackagesRepository {
  private baseUrl = env.API_BASE_URL;

  private mapBackendPackage(pkg: BackendPackage): Package {
    return {
      id: pkg.id,
      businessId: pkg.business_id,
      propertyUnitId: pkg.property_unit_id,
      residentId: pkg.resident_id,
      packageStatusId: pkg.package_status_id,
      carrier: pkg.carrier,
      trackingNumber: pkg.tracking_number,
      qrCode: pkg.qr_code,
      receivedByUserId: pkg.received_by_user_id,
      receivedAt: pkg.received_at,
      deliveredByUserId: pkg.delivered_by_user_id,
      deliveredAt: pkg.delivered_at,
      description: pkg.description,
      notes: pkg.notes,
      notifyResident: pkg.notify_resident,
      notificationSentAt: pkg.notification_sent_at,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      propertyUnitNumber: pkg.property_unit_number,
      residentName: pkg.resident_name,
      statusName: pkg.status_name,
      statusCode: pkg.status_code,
    };
  }

  private mapBackendPackageList(pkg: BackendPackageList): PackageListDTO {
    return {
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      carrier: pkg.carrier,
      propertyUnitNumber: pkg.property_unit_number,
      residentName: pkg.resident_name,
      statusName: pkg.status_name,
      statusCode: pkg.status_code,
      receivedAt: pkg.received_at,
      deliveredAt: pkg.delivered_at,
      createdAt: pkg.created_at,
    };
  }

  async getPackages(params: GetPackagesParams): Promise<PackagesPaginated> {
    const { businessId, token, page = 1, pageSize = 10, propertyUnitId, residentId, packageStatusId, startDate, endDate } = params;

    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());
    if (propertyUnitId) queryParams.set('property_unit_id', propertyUnitId.toString());
    if (residentId) queryParams.set('resident_id', residentId.toString());
    if (packageStatusId) queryParams.set('package_status_id', packageStatusId.toString());
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);

    const url = `${this.baseUrl}/horizontal-properties/packages?${queryParams.toString()}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo paquetes: ${response.statusText}`);
      }

      const data: BackendPackagesPaginatedResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        packages: data.data.map((p) => this.mapBackendPackageList(p)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
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

  async getPackageById(params: GetPackageByIdParams): Promise<Package> {
    const { packageId, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages/${packageId}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo paquete: ${response.statusText}`);
      }

      const data: BackendPackageResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPackage(data.data);
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

  async getPackageByQRCode(params: GetPackageByQRCodeParams): Promise<Package> {
    const { qrCode, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages/qr/${qrCode}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo paquete: ${response.statusText}`);
      }

      const data: BackendPackageResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPackage(data.data);
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

  async receivePackage(params: ReceivePackageParams): Promise<Package> {
    const { businessId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages`;
    const method = 'POST';
    const startTime = Date.now();

    // Transformar datos de camelCase a snake_case para el backend
    const backendData: any = {
      property_unit_id: data.propertyUnitId,
      resident_id: data.residentId || undefined,
      carrier: data.carrier,
      tracking_number: data.trackingNumber,
      description: data.description || undefined,
      notes: data.notes || undefined,
      notify_resident: data.notifyResident ?? false,
    };

    // Remover campos undefined para no enviarlos al backend
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    logHttpRequest({ method, url, body: backendData });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        
        // Parsear errores de validación del backend
        const errorMessage = this.parseValidationErrors(errorData);
        throw new Error(errorMessage);
      }

      const responseData: BackendPackageResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: responseData });

      return this.mapBackendPackage(responseData.data);
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

  async deliverPackage(params: DeliverPackageParams): Promise<Package> {
    const { businessId, packageId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages/${packageId}/deliver`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error entregando paquete: ${response.statusText}`);
      }

      const responseData: BackendPackageResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: responseData });

      return this.mapBackendPackage(responseData.data);
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

  async updatePackageStatus(params: UpdatePackageStatusParams): Promise<Package> {
    const { businessId, packageId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages/${packageId}/status`;
    const method = 'PUT';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error actualizando estado de paquete: ${response.statusText}`);
      }

      const responseData: BackendPackageResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: responseData });

      return this.mapBackendPackage(responseData.data);
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

  async getPackageStatuses(params: GetPackageStatusesParams): Promise<PackageStatus[]> {
    const { token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages/statuses`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo estados: ${response.statusText}`);
      }

      const data = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map((s: { id: number; code: string; name: string; description: string; is_final: boolean; is_active: boolean }) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        description: s.description,
        isFinal: s.is_final,
        isActive: s.is_active,
      }));
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

  async deletePackage(params: DeletePackageParams): Promise<void> {
    const { packageId, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/packages/${packageId}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error eliminando paquete: ${response.statusText}`);
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: {} });
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

  /**
   * Parsea los errores de validación del backend y los convierte en mensajes más amigables en español
   */
  private parseValidationErrors(errorData: any): string {
    if (!errorData || !errorData.error) {
      return errorData.message || 'Error desconocido al recibir el paquete';
    }

    const errorString = errorData.error;
    if (typeof errorString !== 'string') {
      return errorData.message || 'Error desconocido al recibir el paquete';
    }

    const fieldMap: { [key: string]: string } = {
      'PropertyUnitID': 'Unidad de propiedad',
      'property_unit_id': 'Unidad de propiedad',
      'ResidentID': 'Residente',
      'resident_id': 'Residente',
      'Carrier': 'Transportadora',
      'carrier': 'Transportadora',
      'TrackingNumber': 'Número de rastreo',
      'tracking_number': 'Número de rastreo',
      'Description': 'Descripción',
      'description': 'Descripción',
      'Notes': 'Notas',
      'notes': 'Notas',
      'NotifyResident': 'Notificar residente',
      'notify_resident': 'Notificar residente',
    };

    const errors: string[] = [];
    const errorLines = errorString.split('\n').filter(line => line.trim());

    for (const line of errorLines) {
      const keyMatch = line.match(/Key: ['"].*?\.(\w+)['"]|Field validation for ['"](\w+)['"]/);
      if (keyMatch) {
        const fieldName = keyMatch[1] || keyMatch[2];
        const friendlyName = fieldMap[fieldName] || fieldName;

        if (line.includes('required')) {
          errors.push(`${friendlyName} es requerido`);
        } else if (line.includes('min')) {
          errors.push(`${friendlyName} no cumple con el valor mínimo`);
        } else if (line.includes('max')) {
          errors.push(`${friendlyName} excede el valor máximo`);
        } else if (line.includes('email')) {
          errors.push(`${friendlyName} no es un email válido`);
        } else {
          errors.push(`${friendlyName}: ${line.split('Error:')[1]?.trim() || 'valor inválido'}`);
        }
      } else {
        errors.push(this.translateError(line));
      }
    }

    if (errors.length > 0) {
      return `Por favor corrija los siguientes errores:\n• ${errors.join('\n• ')}`;
    }

    return errorData.message || 'Error desconocido al recibir el paquete';
  }

  private translateError(message: string): string {
    if (message.includes('invalid character')) {
      return 'Formato de datos inválido. Verifique la estructura JSON.';
    }
    return message;
  }
}
