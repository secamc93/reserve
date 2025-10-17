/**
 * Repository Implementation: Proxy
 */

import { IProxyRepository, CreateProxyParams, GetProxyParams, UpdateProxyParams, DeleteProxyParams, ListProxiesParams, GetProxiesByPropertyUnitParams } from '../../../domain/ports/attendance';
import { Proxy } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export class ProxyRepository implements IProxyRepository {
  async createProxy(params: CreateProxyParams): Promise<Proxy> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/proxies`;

    // Mapear camelCase → snake_case según contrato del backend
    const payload: Record<string, unknown> = {
      business_id: (params.data as any).businessId,
      property_unit_id: (params.data as any).propertyUnitId,
      proxy_name: (params.data as any).proxyName,
      // DNI opcional
      ...( (params.data as any).proxyDni ? { proxy_dni: (params.data as any).proxyDni } : {} ),
      proxy_email: (params.data as any).proxyEmail,
      proxy_phone: (params.data as any).proxyPhone,
      proxy_address: (params.data as any).proxyAddress,
      proxy_type: (params.data as any).proxyType,
      start_date: (params.data as any).startDate,
      end_date: (params.data as any).endDate,
      power_of_attorney: (params.data as any).powerOfAttorney,
      notes: (params.data as any).notes,
    };

    logHttpRequest({ method: 'POST', url, token: params.token.substring(0, 20) + '...', body: payload });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Apoderado creado exitosamente',
        data: data.data,
      });

      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async getProxyById(params: GetProxyParams): Promise<Proxy> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/proxies/${params.id}`;
    logHttpRequest({ method: 'GET', url, token: params.token.substring(0, 20) + '...' });
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${params.token}` } });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Apoderado obtenido', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async updateProxy(params: UpdateProxyParams): Promise<Proxy> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/proxies/${params.id}`;
    // Mapear campos editables a snake_case
    const body: Record<string, unknown> = {};
    const d: any = params.data || {};
    if (d.proxyName != null) body.proxy_name = d.proxyName;
    if (d.proxyDni != null) body.proxy_dni = d.proxyDni;
    if (d.proxyEmail != null) body.proxy_email = d.proxyEmail;
    if (d.proxyPhone != null) body.proxy_phone = d.proxyPhone;
    if (d.proxyAddress != null) body.proxy_address = d.proxyAddress;
    if (d.proxyType != null) body.proxy_type = d.proxyType;
    if (d.startDate != null) body.start_date = d.startDate;
    if (d.endDate != null) body.end_date = d.endDate;
    if (d.powerOfAttorney != null) body.power_of_attorney = d.powerOfAttorney;
    if (d.isActive != null) body.is_active = d.isActive;
    if (d.notes != null) body.notes = d.notes;

    logHttpRequest({ method: 'PUT', url, token: params.token.substring(0, 20) + '...', body });
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Apoderado actualizado', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async deleteProxy(params: DeleteProxyParams): Promise<void> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/proxies/${params.id}`;
    logHttpRequest({ method: 'DELETE', url, token: params.token.substring(0, 20) + '...' });
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${params.token}` },
      });
      const data = await response.json().catch(() => ({}));
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Apoderado eliminado', data });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async listProxies(params: ListProxiesParams): Promise<Proxy[]> {
    const startTime = Date.now();
    const url = new URL(`${process.env.API_BASE_URL}/attendance/proxies`);
    url.searchParams.append('business_id', String(params.businessId));
    if (params.propertyUnitId) url.searchParams.append('property_unit_id', String(params.propertyUnitId));
    if (params.proxyType) url.searchParams.append('proxy_type', params.proxyType);
    if (params.isActive !== undefined) url.searchParams.append('is_active', String(params.isActive));
    logHttpRequest({ method: 'GET', url: url.toString(), token: params.token.substring(0, 20) + '...' });
    try {
      const response = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${params.token}` } });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Apoderados listados', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async getProxiesByPropertyUnit(params: GetProxiesByPropertyUnitParams): Promise<Proxy[]> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/proxies/unit/${params.unitId}`;
    logHttpRequest({ method: 'GET', url, token: params.token.substring(0, 20) + '...' });
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${params.token}` } });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Apoderados por unidad', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }
}
