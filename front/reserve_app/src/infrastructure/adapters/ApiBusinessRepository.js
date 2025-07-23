import { BusinessService } from '../api/BusinessService.js';

export class ApiBusinessRepository {
    constructor() {
        this.businessService = new BusinessService();
    }

    async getBusinesses(params = {}) {
        try {
            console.log('ApiBusinessRepository: Obteniendo negocios');
            const response = await this.businessService.getBusinesses(params);

            console.log('🔥 Full response from backend:', response);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo negocios');
            }

            // ✅ Acceder a la estructura correcta: response.data.businesses
            return response.data?.businesses || [];
        } catch (error) {
            console.error('ApiBusinessRepository: Error obteniendo negocios:', error);
            throw error;
        }
    }

    async getBusinessById(id) {
        try {
            console.log('ApiBusinessRepository: Obteniendo negocio por ID:', id);
            const response = await this.businessService.getBusinessById(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo negocio');
            }

            return response.data;
        } catch (error) {
            console.error('ApiBusinessRepository: Error obteniendo negocio por ID:', error);
            throw error;
        }
    }

    async createBusiness(businessData) {
        try {
            console.log('ApiBusinessRepository: Creando negocio');
            const response = await this.businessService.createBusiness(businessData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error creando negocio');
            }

            return response.data;
        } catch (error) {
            console.error('ApiBusinessRepository: Error creando negocio:', error);
            throw error;
        }
    }

    async updateBusiness(id, businessData) {
        try {
            console.log('ApiBusinessRepository: Actualizando negocio');
            const response = await this.businessService.updateBusiness(id, businessData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error actualizando negocio');
            }

            return response.data;
        } catch (error) {
            console.error('ApiBusinessRepository: Error actualizando negocio:', error);
            throw error;
        }
    }

    async deleteBusiness(id) {
        try {
            console.log('ApiBusinessRepository: Eliminando negocio');
            const response = await this.businessService.deleteBusiness(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error eliminando negocio');
            }

            return response.message || 'Negocio eliminado exitosamente';
        } catch (error) {
            console.error('ApiBusinessRepository: Error eliminando negocio:', error);
            throw error;
        }
    }
} 