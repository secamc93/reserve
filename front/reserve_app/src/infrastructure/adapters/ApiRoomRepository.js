import { RoomService } from '../api/RoomService.js';

export class ApiRoomRepository {
    constructor() {
        this.roomService = new RoomService();
    }

    async getRooms(params = {}) {
        try {
            console.log('ApiRoomRepository: Obteniendo salas');
            const response = await this.roomService.getRooms(params);

            console.log('ApiRoomRepository: Respuesta completa:', response);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo salas');
            }

            console.log('ApiRoomRepository: Datos a devolver:', response.data);
            return response.data || [];
        } catch (error) {
            console.error('ApiRoomRepository: Error obteniendo salas:', error);
            throw error;
        }
    }

    async getRoomsByBusiness(businessId) {
        try {
            console.log('ApiRoomRepository: Obteniendo salas del negocio:', businessId);
            const response = await this.roomService.getRoomsByBusiness(businessId);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo salas del negocio');
            }

            return response.data || [];
        } catch (error) {
            console.error('ApiRoomRepository: Error obteniendo salas del negocio:', error);
            throw error;
        }
    }

    async getRoomById(id) {
        try {
            console.log('ApiRoomRepository: Obteniendo sala por ID:', id);
            const response = await this.roomService.getRoomById(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error obteniendo sala');
            }

            return response.data;
        } catch (error) {
            console.error('ApiRoomRepository: Error obteniendo sala por ID:', error);
            throw error;
        }
    }

    async createRoom(roomData) {
        try {
            console.log('ApiRoomRepository: Creando sala');
            const response = await this.roomService.createRoom(roomData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error creando sala');
            }

            return response.data;
        } catch (error) {
            console.error('ApiRoomRepository: Error creando sala:', error);
            throw error;
        }
    }

    async updateRoom(id, roomData) {
        try {
            console.log('ApiRoomRepository: Actualizando sala');
            const response = await this.roomService.updateRoom(id, roomData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error actualizando sala');
            }

            return response.data;
        } catch (error) {
            console.error('ApiRoomRepository: Error actualizando sala:', error);
            throw error;
        }
    }

    async deleteRoom(id) {
        try {
            console.log('ApiRoomRepository: Eliminando sala');
            const response = await this.roomService.deleteRoom(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error eliminando sala');
            }

            return response.message || 'Sala eliminada exitosamente';
        } catch (error) {
            console.error('ApiRoomRepository: Error eliminando sala:', error);
            throw error;
        }
    }
} 