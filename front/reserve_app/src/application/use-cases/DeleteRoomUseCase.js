export class DeleteRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute(id) {
        try {
            console.log('DeleteRoomUseCase: Ejecutando para ID:', id);
            
            if (!id) {
                throw new Error('ID de sala es requerido');
            }
            
            // Enviar solicitud al repositorio
            const result = await this.roomRepository.deleteRoom(id);
            
            console.log('DeleteRoomUseCase: Sala eliminada exitosamente:', id);
            
            return {
                success: true,
                message: result || 'Sala eliminada exitosamente'
            };
        } catch (error) {
            console.error('DeleteRoomUseCase: Error eliminando sala:', error);
            throw error;
        }
    }
} 