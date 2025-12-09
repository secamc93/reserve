/**
 * Implementación del repositorio de Businesses
 */

import { 
  IBusinessesRepository, 
  GetBusinessesParams
} from '../../../domain/ports';
import { Business, BusinessesPaginated } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendBusinessesResponse } from '../response';

export class BusinessesRepository implements IBusinessesRepository {
  async getBusinesses(params: GetBusinessesParams): Promise<BusinessesPaginated> {
    const { 
      token, 
      page = 1, 
      per_page = 10, 
      name,
      business_type_id
    } = params;

    // Construir query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    });

    if (name && name.trim() !== '') {
      queryParams.append('name', name.trim());
    }
    if (business_type_id !== undefined) {
      queryParams.append('business_type_id', business_type_id.toString());
    }

    const url = `${env.API_BASE_URL}/businesses?${queryParams.toString()}`;
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
      const backendResponse: BackendBusinessesResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error obteniendo businesses: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.length} businesses obtenidos`,
        data: backendResponse,
      });

      // Mapear la respuesta del backend al dominio
      const businesses: Business[] = backendResponse.data.map(business => ({
        id: business.id,
        name: business.name,
        description: business.description || undefined,
        address: business.address,
        phone: business.phone || undefined,
        email: business.email || undefined,
        website: business.website || undefined,
        logo_url: business.logo_url || undefined,
        primary_color: business.primary_color || undefined,
        secondary_color: business.secondary_color || undefined,
        tertiary_color: business.tertiary_color || undefined,
        quaternary_color: business.quaternary_color || undefined,
        navbar_image_url: business.navbar_image_url || undefined,
        is_active: business.is_active,
        business_type_id: business.business_type_id,
        business_type: business.business_type && business.business_type.trim() !== '' ? business.business_type : undefined,
        created_at: business.created_at,
        updated_at: business.updated_at,
      }));

      return {
        data: businesses,
        pagination: backendResponse.pagination,
      };
    } catch (error) {
      console.error('Error obteniendo businesses:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener businesses del servidor'
      );
    }
  }
}

