import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class TableService {
    constructor() {
        this.httpClient = new HttpClient(config.API_BASE_URL);
    }

    async getTables(params = {}) {
        try {
            console.log('TableService: Obteniendo mesas con filtros:', params);
            const response = await this.httpClient.get('/api/v1/tables', params);
            console.log('TableService: Respuesta mesas:', response);
            return response;
        } catch (error) {
            console.error('TableService: Error obteniendo mesas:', error);
            throw error;
        }
    }

    async getTableById(id) {
        try {
            console.log('TableService: Obteniendo mesa ID:', id);
            const response = await this.httpClient.get(`/api/v1/tables/${id}`);
            console.log('TableService: Respuesta mesa:', response);
            return response;
        } catch (error) {
            console.error('TableService: Error obteniendo mesa:', error);
            throw error;
        }
    }

    async createTable(tableData) {
        try {
            console.log('TableService: Creando mesa:', tableData);
            const response = await this.httpClient.post('/api/v1/tables', tableData);
            console.log('TableService: Mesa creada:', response);
            return response;
        } catch (error) {
            console.error('TableService: Error creando mesa:', error);
            throw error;
        }
    }

    async updateTable(id, tableData) {
        try {
            console.log('TableService: Actualizando mesa ID:', id, 'Datos:', tableData);
            const response = await this.httpClient.put(`/api/v1/tables/${id}`, tableData);
            console.log('TableService: Mesa actualizada:', response);
            return response;
        } catch (error) {
            console.error('TableService: Error actualizando mesa:', error);
            throw error;
        }
    }

    async deleteTable(id) {
        try {
            console.log('TableService: Eliminando mesa ID:', id);
            const response = await this.httpClient.delete(`/api/v1/tables/${id}`);
            console.log('TableService: Mesa eliminada:', response);
            return response;
        } catch (error) {
            console.error('TableService: Error eliminando mesa:', error);
            throw error;
        }
    }
} 