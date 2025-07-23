import { Business } from '../../domain/entities/Business.js';

export class GetBusinessesUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }

    async execute(params = {}) {
        try {
            console.log('GetBusinessesUseCase: Ejecutando con parámetros:', params);
            
            const businessesData = await this.businessRepository.getBusinesses(params);
            
            // Convertir datos a entidades Business
            const businesses = businessesData.map(businessData => new Business(businessData));
            
            console.log('GetBusinessesUseCase: Negocios obtenidos:', businesses.length);
            
            return {
                success: true,
                data: businesses,
                total: businesses.length
            };
        } catch (error) {
            console.error('GetBusinessesUseCase: Error obteniendo negocios:', error);
            throw error;
        }
    }
} 