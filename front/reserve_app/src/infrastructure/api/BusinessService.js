import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class BusinessService {
    constructor() {
        this.httpClient = new HttpClient(config.API_BASE_URL);
    }

    async getBusinesses(params = {}) {
        try {
            console.log('BusinessService: Obteniendo negocios con filtros:', params);
            const response = await this.httpClient.get('/api/v1/businesses', params);
            console.log('BusinessService: Respuesta negocios:', response);
            return response;
        } catch (error) {
            console.error('BusinessService: Error obteniendo negocios:', error);
            throw error;
        }
    }

    async getBusinessById(id) {
        try {
            console.log('BusinessService: Obteniendo negocio ID:', id);
            const response = await this.httpClient.get(`/api/v1/businesses/${id}`);
            console.log('BusinessService: Respuesta negocio:', response);
            return response;
        } catch (error) {
            console.error('BusinessService: Error obteniendo negocio:', error);
            throw error;
        }
    }

    async createBusiness(businessData) {
        try {
            console.log('BusinessService: Creando negocio:', businessData);
            const response = await this.httpClient.post('/api/v1/businesses', businessData);
            console.log('BusinessService: Negocio creado:', response);
            return response;
        } catch (error) {
            console.error('BusinessService: Error creando negocio:', error);
            throw error;
        }
    }

    async updateBusiness(id, businessData) {
        try {
            console.log('BusinessService: Actualizando negocio ID:', id, 'Datos:', businessData);
            const response = await this.httpClient.put(`/api/v1/businesses/${id}`, businessData);
            console.log('BusinessService: Negocio actualizado:', response);
            return response;
        } catch (error) {
            console.error('BusinessService: Error actualizando negocio:', error);
            throw error;
        }
    }

    async deleteBusiness(id) {
        try {
            console.log('BusinessService: Eliminando negocio ID:', id);
            const response = await this.httpClient.delete(`/api/v1/businesses/${id}`);
            console.log('BusinessService: Negocio eliminado:', response);
            return response;
        } catch (error) {
            console.error('BusinessService: Error eliminando negocio:', error);
            throw error;
        }
    }
} 