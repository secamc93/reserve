/**
 * Implementación del repositorio de Propiedades Horizontales
 */

import { 
  IHorizontalPropertiesRepository, 
  GetHorizontalPropertiesParams,
  GetHorizontalPropertyByIdParams,
  CreateHorizontalPropertyParams
} from '../../domain/ports';
import { HorizontalProperty, HorizontalPropertiesPaginated } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { 
  BackendHorizontalPropertiesResponse,
  BackendGetHorizontalPropertyByIdResponse, 
  BackendCreateHorizontalPropertyResponse 
} from './response';

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

  async getHorizontalPropertyById(params: GetHorizontalPropertyByIdParams): Promise<HorizontalProperty> {
    const { token, id } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/${id}`;
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
      const backendResponse: BackendGetHorizontalPropertyByIdResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error obteniendo propiedad horizontal: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Propiedad "${backendResponse.data.name}" obtenida`,
        data: backendResponse,
      });

      const p = backendResponse.data;
      const property: HorizontalProperty = {
        id: p.id,
        name: p.name,
        code: p.code,
        businessTypeName: p.business_type_name,
        businessTypeId: p.business_type_id,
        address: p.address,
        totalUnits: p.total_units,
        isActive: p.is_active,
        createdAt: p.created_at,
        description: p.description,
        logoUrl: p.logo_url,
        primaryColor: p.primary_color,
        secondaryColor: p.secondary_color,
        tertiaryColor: p.tertiary_color,
        quaternaryColor: p.quaternary_color,
        navbarImageUrl: p.navbar_image_url,
        customDomain: p.custom_domain,
        hasElevator: p.has_elevator,
        hasParking: p.has_parking,
        hasPool: p.has_pool,
        hasGym: p.has_gym,
        hasSocialArea: p.has_social_area,
        totalFloors: p.total_floors,
        timezone: p.timezone,
        updatedAt: p.updated_at,
        propertyUnits: p.property_units,
        committees: p.committees,
      };

      return property;
    } catch (error) {
      console.error('Error obteniendo propiedad horizontal:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener propiedad horizontal del servidor'
      );
    }
  }

  async createHorizontalProperty(params: CreateHorizontalPropertyParams): Promise<HorizontalProperty> {
    const { token, data } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties`;
    const startTime = Date.now();

    // Crear FormData para enviar archivos
    const formData = new FormData();
    
    // Campos requeridos
    formData.append('name', data.name);
    formData.append('code', data.code);
    formData.append('address', data.address);
    formData.append('timezone', data.timezone);
    formData.append('total_units', data.totalUnits.toString());
    
    // Campos opcionales - información básica
    if (data.description) formData.append('description', data.description);
    if (data.totalFloors !== undefined) formData.append('total_floors', data.totalFloors.toString());
    
    // Amenidades
    if (data.hasElevator !== undefined) formData.append('has_elevator', data.hasElevator.toString());
    if (data.hasParking !== undefined) formData.append('has_parking', data.hasParking.toString());
    if (data.hasPool !== undefined) formData.append('has_pool', data.hasPool.toString());
    if (data.hasGym !== undefined) formData.append('has_gym', data.hasGym.toString());
    if (data.hasSocialArea !== undefined) formData.append('has_social_area', data.hasSocialArea.toString());
    
    // Archivos
    if (data.logoFile) formData.append('logo_file', data.logoFile);
    if (data.navbarImageFile) formData.append('navbar_image_file', data.navbarImageFile);
    
    // Personalización
    if (data.primaryColor) formData.append('primary_color', data.primaryColor);
    if (data.secondaryColor) formData.append('secondary_color', data.secondaryColor);
    if (data.tertiaryColor) formData.append('tertiary_color', data.tertiaryColor);
    if (data.quaternaryColor) formData.append('quaternary_color', data.quaternaryColor);
    if (data.customDomain) formData.append('custom_domain', data.customDomain);
    
    // Creación automática de unidades
    if (data.createUnits !== undefined) formData.append('create_units', data.createUnits.toString());
    if (data.unitPrefix) formData.append('unit_prefix', data.unitPrefix);
    if (data.unitType) formData.append('unit_type', data.unitType);
    if (data.unitsPerFloor !== undefined) formData.append('units_per_floor', data.unitsPerFloor.toString());
    if (data.startUnitNumber !== undefined) formData.append('start_unit_number', data.startUnitNumber.toString());
    
    // Comités
    if (data.createRequiredCommittees !== undefined) formData.append('create_required_committees', data.createRequiredCommittees.toString());

    logHttpRequest({
      method: 'POST',
      url,
      token,
      body: `FormData con ${data.logoFile ? 'logo' : 'sin logo'}, ${data.navbarImageFile ? 'navbar image' : 'sin navbar image'}`,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO incluir Content-Type, el browser lo establecerá automáticamente con el boundary para multipart/form-data
        },
        body: formData,
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendCreateHorizontalPropertyResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error creando propiedad horizontal: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Propiedad "${backendResponse.data.name}" creada con ID ${backendResponse.data.id}`,
        data: backendResponse,
      });

      // Mapear a entidad de dominio
      const property: HorizontalProperty = {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        code: backendResponse.data.code,
        businessTypeName: backendResponse.data.business_type_name,
        address: backendResponse.data.address,
        totalUnits: backendResponse.data.total_units,
        isActive: backendResponse.data.is_active,
        createdAt: backendResponse.data.created_at,
        description: backendResponse.data.description,
        logoUrl: backendResponse.data.logo_url,
        primaryColor: backendResponse.data.primary_color,
        secondaryColor: backendResponse.data.secondary_color,
        tertiaryColor: backendResponse.data.tertiary_color,
        quaternaryColor: backendResponse.data.quaternary_color,
        navbarImageUrl: backendResponse.data.navbar_image_url,
        customDomain: backendResponse.data.custom_domain,
        hasElevator: backendResponse.data.has_elevator,
        hasParking: backendResponse.data.has_parking,
        hasPool: backendResponse.data.has_pool,
        hasGym: backendResponse.data.has_gym,
        hasSocialArea: backendResponse.data.has_social_area,
        totalFloors: backendResponse.data.total_floors,
        timezone: backendResponse.data.timezone,
        updatedAt: backendResponse.data.updated_at,
      };

      return property;
    } catch (error) {
      console.error('Error creando propiedad horizontal:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear propiedad horizontal en el servidor'
      );
    }
  }
}

