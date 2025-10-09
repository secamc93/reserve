/**
 * Implementación del repositorio de Propiedades Horizontales
 */

import { 
  IHorizontalPropertiesRepository, 
  GetHorizontalPropertiesParams 
} from '../../domain/ports/horizontal-properties.repository';
import { HorizontalProperty, HorizontalPropertiesPaginated } from '../../domain/entities/horizontal-property.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendHorizontalPropertiesResponse } from './response';

export class HorizontalPropertiesRepository implements IHorizontalPropertiesRepository {
  async getHorizontalProperties(params: GetHorizontalPropertiesParams): Promise<HorizontalPropertiesPaginated> {
    const { 
      token, 
      page = 1, 
      pageSize = 10, 
      name, 
      code, 
      isActive, 
      orderBy, 
      orderDir 
    } = params;

    // Construir query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (name) queryParams.append('name', name);
    if (code) queryParams.append('code', code);
    if (isActive !== undefined) queryParams.append('is_active', isActive.toString());
    if (orderBy) queryParams.append('order_by', orderBy);
    if (orderDir) queryParams.append('order_dir', orderDir);

    const url = `${env.API_BASE_URL}/horizontal-properties?${queryParams.toString()}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'GET',
      url,
      token,
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendHorizontalPropertiesResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error obteniendo propiedades horizontales: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.data.length} propiedades obtenidas (página ${backendResponse.data.page}/${backendResponse.data.total_pages})`,
        data: backendResponse,
      });

      // Mapear a entidades de dominio
      const properties: HorizontalProperty[] = backendResponse.data.data.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        businessTypeName: p.business_type_name,
        address: p.address,
        totalUnits: p.total_units,
        isActive: p.is_active,
        createdAt: p.created_at,
      }));

      return {
        data: properties,
        total: backendResponse.data.total,
        page: backendResponse.data.page,
        pageSize: backendResponse.data.page_size,
        totalPages: backendResponse.data.total_pages,
      };
    } catch (error) {
      console.error('Error obteniendo propiedades horizontales:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener propiedades horizontales del servidor'
      );
    }
  }
}

