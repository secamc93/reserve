import { Room } from '../../domain/entities/Room.js';

export class UpdateRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute(id, roomData) {
        try {
            console.log('UpdateRoomUseCase: Ejecutando para ID:', id, 'con datos:', roomData);
            
            if (!id) {
                throw new Error('ID de sala es requerido');
            }
            
            // Validar datos requeridos
            if (!roomData.business_id || !roomData.name || !roomData.code || !roomData.capacity) {
                throw new Error('ID de negocio, nombre, código y capacidad son requeridos');
            }
            
            // Crear entidad Room
            const room = new Room({ id, ...roomData });
            
            // Validar que la entidad sea válida
            if (!room.isValid()) {
                throw new Error('Datos de sala inválidos');
            }
            
            // Validar capacidad
            const capacityError = room.validateCapacity();
            if (capacityError) {
                throw new Error(capacityError);
            }
            
            // Enviar datos al repositorio
            const updatedRoomData = await this.roomRepository.updateRoom(id, room.toUpdateData());
            
            // Convertir respuesta a entidad
            const updatedRoom = new Room(updatedRoomData);
            
            console.log('UpdateRoomUseCase: Sala actualizada exitosamente:', updatedRoom.id);
            
            return {
                success: true,
                data: updatedRoom,
                message: 'Sala actualizada exitosamente'
            };
        } catch (error) {
            console.error('UpdateRoomUseCase: Error actualizando sala:', error);
            throw error;
        }
    }
} 