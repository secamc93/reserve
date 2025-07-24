import { Room } from '../../domain/entities/Room.js';

export class GetRoomsByBusinessUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute(businessId) {
        try {
            console.log('GetRoomsByBusinessUseCase: Ejecutando para negocio:', businessId);
            
            if (!businessId) {
                throw new Error('ID de negocio es requerido');
            }
            
            // Obtener datos del repositorio
            const roomsData = await this.roomRepository.getRoomsByBusiness(businessId);
            
            // Convertir datos a entidades Room
            const rooms = roomsData.map(roomData => new Room(roomData));
            
            console.log('GetRoomsByBusinessUseCase: Salas del negocio obtenidas exitosamente:', rooms.length);
            
            return {
                success: true,
                data: rooms,
                message: `${rooms.length} salas del negocio obtenidas`
            };
        } catch (error) {
            console.error('GetRoomsByBusinessUseCase: Error obteniendo salas del negocio:', error);
            throw error;
        }
    }
} 