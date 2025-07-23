export class DeleteTableUseCase {
    constructor(tableRepository) {
        this.tableRepository = tableRepository;
    }

    async execute(id) {
        try {
            console.log('DeleteTableUseCase: Ejecutando para ID:', id);
            
            // Validar ID
            if (!id) {
                throw new Error('ID de mesa es requerido');
            }
            
            // Enviar solicitud al repositorio
            const result = await this.tableRepository.deleteTable(id);
            
            console.log('DeleteTableUseCase: Mesa eliminada exitosamente:', id);
            
            return {
                success: true,
                message: result || 'Mesa eliminada exitosamente'
            };
        } catch (error) {
            console.error('DeleteTableUseCase: Error eliminando mesa:', error);
            throw error;
        }
    }
} 