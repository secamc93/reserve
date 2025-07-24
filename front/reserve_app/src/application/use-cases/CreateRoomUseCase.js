import { Room } from '../../domain/entities/Room.js';

export class CreateRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute(roomData) {
        try {
            console.log('CreateRoomUseCase: Ejecutando con datos:', roomData);
            
            // Validar datos requeridos
            if (!roomData.business_id || !roomData.name || !roomData.code || !roomData.capacity) {
                throw new Error('ID de negocio, nombre, código y capacidad son requeridos');
            }
            
            // Crear entidad Room
            const room = new Room(roomData);
            
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
            const createdRoomData = await this.roomRepository.createRoom(room.toCreateData());
            
            // Convertir respuesta a entidad
            const createdRoom = new Room(createdRoomData);
            
            console.log('CreateRoomUseCase: Sala creada exitosamente:', createdRoom.id);
            
            return {
                success: true,
                data: createdRoom,
                message: 'Sala creada exitosamente'
            };
        } catch (error) {
            console.error('CreateRoomUseCase: Error creando sala:', error);
            throw error;
        }
    }
} 