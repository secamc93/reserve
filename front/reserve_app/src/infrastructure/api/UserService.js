import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class UserService {
    constructor() {
        this.httpClient = new HttpClient(config.API_BASE_URL);
    }

    async getUsers(params = {}) {
        try {
            console.log('UserService: Obteniendo usuarios con filtros:', params);
            const response = await this.httpClient.get('/api/v1/users', params);
            console.log('UserService: Respuesta usuarios:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error obteniendo usuarios:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try {
            console.log('UserService: Obteniendo usuario ID:', id);
            const response = await this.httpClient.get(`/api/v1/users/${id}`);
            console.log('UserService: Respuesta usuario:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error obteniendo usuario:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            console.log('UserService: Creando usuario:', userData);
            const response = await this.httpClient.post('/api/v1/users', userData);
            console.log('UserService: Usuario creado:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error creando usuario:', error);
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            console.log('UserService: Actualizando usuario ID:', id, 'Datos:', userData);
            const response = await this.httpClient.put(`/api/v1/users/${id}`, userData);
            console.log('UserService: Usuario actualizado:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error actualizando usuario:', error);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            console.log('UserService: Eliminando usuario ID:', id);
            const response = await this.httpClient.delete(`/api/v1/users/${id}`);
            console.log('UserService: Usuario eliminado:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error eliminando usuario:', error);
            throw error;
        }
    }

    // Servicios de Roles
    async getRoles(params = {}) {
        try {
            console.log('UserService: Obteniendo roles');
            const response = await this.httpClient.get('/api/v1/roles', params);
            console.log('UserService: Roles obtenidos:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error obteniendo roles:', error);
            throw error;
        }
    }

    async getRoleById(id) {
        try {
            console.log('UserService: Obteniendo rol ID:', id);
            const response = await this.httpClient.get(`/api/v1/roles/${id}`);
            console.log('UserService: Rol obtenido:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error obteniendo rol:', error);
            throw error;
        }
    }
} 