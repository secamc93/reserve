import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class RoomService {
    constructor() {
        this.httpClient = new HttpClient(config.API_BASE_URL);
    }

    async getRooms(params = {}) {
        try {
            console.log('RoomService: Obteniendo salas con filtros:', params);
            const response = await this.httpClient.get('/api/v1/rooms', params);
            console.log('RoomService: Respuesta salas:', response);
            return response;
        } catch (error) {
            console.error('RoomService: Error obteniendo salas:', error);
            throw error;
        }
    }

    async getRoomsByBusiness(businessId) {
        try {
            console.log('RoomService: Obteniendo salas del negocio ID:', businessId);
            const response = await this.httpClient.get(`/api/v1/business-rooms/${businessId}`);
            console.log('RoomService: Respuesta salas del negocio:', response);
            return response;
        } catch (error) {
            console.error('RoomService: Error obteniendo salas del negocio:', error);
            throw error;
        }
    }

    async getRoomById(id) {
        try {
            console.log('RoomService: Obteniendo sala ID:', id);
            const response = await this.httpClient.get(`/api/v1/rooms/${id}`);
            console.log('RoomService: Respuesta sala:', response);
            return response;
        } catch (error) {
            console.error('RoomService: Error obteniendo sala:', error);
            throw error;
        }
    }

    async createRoom(roomData) {
        try {
            console.log('RoomService: Creando sala:', roomData);
            const response = await this.httpClient.post('/api/v1/rooms', roomData);
            console.log('RoomService: Sala creada:', response);
            return response;
        } catch (error) {
            console.error('RoomService: Error creando sala:', error);
            throw error;
        }
    }

    async updateRoom(id, roomData) {
        try {
            console.log('RoomService: Actualizando sala ID:', id, 'Datos:', roomData);
            const response = await this.httpClient.put(`/api/v1/rooms/${id}`, roomData);
            console.log('RoomService: Sala actualizada:', response);
            return response;
        } catch (error) {
            console.error('RoomService: Error actualizando sala:', error);
            throw error;
        }
    }

    async deleteRoom(id) {
        try {
            console.log('RoomService: Eliminando sala ID:', id);
            const response = await this.httpClient.delete(`/api/v1/rooms/${id}`);
            console.log('RoomService: Sala eliminada:', response);
            return response;
        } catch (error) {
            console.error('RoomService: Error eliminando sala:', error);
            throw error;
        }
    }
} 