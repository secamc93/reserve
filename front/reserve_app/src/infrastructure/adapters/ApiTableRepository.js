import { TableService } from '../api/TableService.js';

export class ApiTableRepository {
    constructor() {
        this.tableService = new TableService();
    }

    async getTables(params = {}) {
        try {
            console.log('ApiTableRepository: Obteniendo mesas');
            const response = await this.tableService.getTables(params);

            console.log('🔥 Full response from backend:', response);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo mesas');
            }

            return response.data || [];
        } catch (error) {
            console.error('ApiTableRepository: Error obteniendo mesas:', error);
            throw error;
        }
    }

    async getTableById(id) {
        try {
            console.log('ApiTableRepository: Obteniendo mesa por ID:', id);
            const response = await this.tableService.getTableById(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo mesa');
            }

            return response.data;
        } catch (error) {
            console.error('ApiTableRepository: Error obteniendo mesa por ID:', error);
            throw error;
        }
    }

    async createTable(tableData) {
        try {
            console.log('ApiTableRepository: Creando mesa');
            const response = await this.tableService.createTable(tableData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error creando mesa');
            }

            return response.data;
        } catch (error) {
            console.error('ApiTableRepository: Error creando mesa:', error);
            throw error;
        }
    }

    async updateTable(id, tableData) {
        try {
            console.log('ApiTableRepository: Actualizando mesa');
            const response = await this.tableService.updateTable(id, tableData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error actualizando mesa');
            }

            return response.data;
        } catch (error) {
            console.error('ApiTableRepository: Error actualizando mesa:', error);
            throw error;
        }
    }

    async deleteTable(id) {
        try {
            console.log('ApiTableRepository: Eliminando mesa');
            const response = await this.tableService.deleteTable(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error eliminando mesa');
            }

            return response.message || 'Mesa eliminada exitosamente';
        } catch (error) {
            console.error('ApiTableRepository: Error eliminando mesa:', error);
            throw error;
        }
    }
} 