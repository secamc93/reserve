import { Room } from '../../domain/entities/Room.js';

export class GetRoomsUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute(params = {}) {
        try {
            console.log('GetRoomsUseCase: Ejecutando con parámetros:', params);
            
            // Test de la entidad Room con datos simulados
            const testData = {
                "ID": 1,
                "BusinessID": 1,
                "Name": "Sala 1",
                "Code": "asd",
                "Description": "Restaurante italiano de prueba para desarrollo",
                "Capacity": 40,
                "IsActive": false,
                "MinCapacity": 10,
                "MaxCapacity": 30,
                "CreatedAt": "2025-07-23T22:29:20.581195-05:00",
                "UpdatedAt": "2025-07-23T22:29:20.581195-05:00",
                "DeletedAt": null
            };
            const testRoom = new Room(testData);
            console.log('GetRoomsUseCase: Test Room creado:', testRoom);
            
            // Obtener datos del repositorio
            const roomsData = await this.roomRepository.getRooms(params);
            
            console.log('GetRoomsUseCase: Datos crudos recibidos:', roomsData);
            console.log('GetRoomsUseCase: Tipo de datos:', typeof roomsData, Array.isArray(roomsData));
            
            // Convertir datos a entidades Room
            const rooms = roomsData.map(roomData => {
                console.log('GetRoomsUseCase: Procesando sala:', roomData);
                console.log('GetRoomsUseCase: Tipo de roomData:', typeof roomData);
                const room = new Room(roomData);
                console.log('GetRoomsUseCase: Sala procesada:', room);
                return room;
            });
            
            console.log('GetRoomsUseCase: Salas obtenidas exitosamente:', rooms.length);
            
            return {
                success: true,
                data: rooms,
                message: `${rooms.length} salas obtenidas`
            };
        } catch (error) {
            console.error('GetRoomsUseCase: Error obteniendo salas:', error);
            throw error;
        }
    }
} 