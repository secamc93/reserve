import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class BusinessTypeService {
    constructor() {
        this.httpClient = new HttpClient(config.API_BASE_URL);
        console.log('BASE URL usada en BusinessTypeService:', config.API_BASE_URL);
    }

    async getBusinessTypes(params = {}) {
        try {
            console.log('BusinessTypeService: Obteniendo tipos de negocio con filtros:', params);
            const response = await this.httpClient.get('/api/v1/business-types', params);
            console.log('BusinessTypeService: Respuesta tipos de negocio:', response);
            return response;
        } catch (error) {
            console.error('BusinessTypeService: Error obteniendo tipos de negocio:', error);
            throw error;
        }
    }

    async getBusinessTypeById(id) {
        try {
            console.log('BusinessTypeService: Obteniendo tipo de negocio ID:', id);
            const response = await this.httpClient.get(`/api/v1/business-types/${id}`);
            console.log('BusinessTypeService: Respuesta tipo de negocio:', response);
            return response;
        } catch (error) {
            console.error('BusinessTypeService: Error obteniendo tipo de negocio:', error);
            throw error;
        }
    }

    async createBusinessType(businessTypeData) {
        try {
            console.log('BusinessTypeService: Creando tipo de negocio:', businessTypeData);
            const response = await this.httpClient.post('/api/v1/business-types', businessTypeData);
            console.log('BusinessTypeService: Tipo de negocio creado:', response);
            return response;
        } catch (error) {
            console.error('BusinessTypeService: Error creando tipo de negocio:', error);
            throw error;
        }
    }

    async updateBusinessType(id, businessTypeData) {
        try {
            console.log('BusinessTypeService: Actualizando tipo de negocio ID:', id, 'Datos:', businessTypeData);
            const response = await this.httpClient.put(`/api/v1/business-types/${id}`, businessTypeData);
            console.log('BusinessTypeService: Tipo de negocio actualizado:', response);
            return response;
        } catch (error) {
            console.error('BusinessTypeService: Error actualizando tipo de negocio:', error);
            throw error;
        }
    }

    async deleteBusinessType(id) {
        try {
            console.log('BusinessTypeService: Eliminando tipo de negocio ID:', id);
            const response = await this.httpClient.delete(`/api/v1/business-types/${id}`);
            console.log('BusinessTypeService: Tipo de negocio eliminado:', response);
            return response;
        } catch (error) {
            console.error('BusinessTypeService: Error eliminando tipo de negocio:', error);
            throw error;
        }
    }
} 