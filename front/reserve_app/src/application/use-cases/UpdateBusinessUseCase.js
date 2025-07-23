import { Business } from '../../domain/entities/Business.js';

export class UpdateBusinessUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }

    async execute(id, businessData) {
        try {
            console.log('UpdateBusinessUseCase: Ejecutando para ID:', id, 'con datos:', businessData);
            
            // Validar ID
            if (!id) {
                throw new Error('ID de negocio es requerido');
            }
            
            // Validar datos requeridos
            if (!businessData.name || !businessData.code || !businessData.business_type_id) {
                throw new Error('Nombre, código y tipo de negocio son requeridos');
            }
            
            // Crear entidad Business
            const business = new Business({ ...businessData, id });
            
            // Validar que la entidad sea válida
            if (!business.isValid()) {
                throw new Error('Datos de negocio inválidos');
            }
            
            // Enviar datos al repositorio
            const updatedBusinessData = await this.businessRepository.updateBusiness(id, business.toRequestData());
            
            // Convertir respuesta a entidad
            const updatedBusiness = new Business(updatedBusinessData);
            
            console.log('UpdateBusinessUseCase: Negocio actualizado exitosamente:', updatedBusiness.id);
            
            return {
                success: true,
                data: updatedBusiness,
                message: 'Negocio actualizado exitosamente'
            };
        } catch (error) {
            console.error('UpdateBusinessUseCase: Error actualizando negocio:', error);
            throw error;
        }
    }
} 