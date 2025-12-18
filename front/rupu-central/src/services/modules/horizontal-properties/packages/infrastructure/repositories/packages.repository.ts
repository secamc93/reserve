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
  Package,
  PackageListDTO,
  PackagesPaginated,
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
        throw new Error(errorData.message || `Error recibiendo paquete: ${response.statusText}`);
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
}
