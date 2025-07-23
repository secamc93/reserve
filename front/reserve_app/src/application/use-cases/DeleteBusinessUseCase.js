export class DeleteBusinessUseCase {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }

    async execute(id) {
        try {
            console.log('DeleteBusinessUseCase: Ejecutando para ID:', id);
            
            // Validar ID
            if (!id) {
                throw new Error('ID de negocio es requerido');
            }
            
            // Enviar solicitud al repositorio
            const result = await this.businessRepository.deleteBusiness(id);
            
            console.log('DeleteBusinessUseCase: Negocio eliminado exitosamente:', id);
            
            return {
                success: true,
                message: result || 'Negocio eliminado exitosamente'
            };
        } catch (error) {
            console.error('DeleteBusinessUseCase: Error eliminando negocio:', error);
            throw error;
        }
    }
} 