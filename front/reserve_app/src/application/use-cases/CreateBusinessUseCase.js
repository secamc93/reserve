import { Business } from '../../domain/entities/Business.js';

export class CreateBusinessUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }

    async execute(businessData) {
        try {
            console.log('CreateBusinessUseCase: Ejecutando con datos:', businessData);
            
            // Validar datos requeridos
            if (!businessData.name || !businessData.code || !businessData.business_type_id) {
                throw new Error('Nombre, código y tipo de negocio son requeridos');
            }
            
            // Crear entidad Business
            const business = new Business(businessData);
            
            // Validar que la entidad sea válida
            if (!business.isValid()) {
                throw new Error('Datos de negocio inválidos');
            }
            
            // Enviar datos al repositorio
            const createdBusinessData = await this.businessRepository.createBusiness(business.toRequestData());
            
            // Convertir respuesta a entidad
            const createdBusiness = new Business(createdBusinessData);
            
            console.log('CreateBusinessUseCase: Negocio creado exitosamente:', createdBusiness.id);
            
            return {
                success: true,
                data: createdBusiness,
                message: 'Negocio creado exitosamente'
            };
        } catch (error) {
            console.error('CreateBusinessUseCase: Error creando negocio:', error);
            throw error;
        }
    }
} 