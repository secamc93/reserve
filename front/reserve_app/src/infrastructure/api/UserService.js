import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class UserService {
    constructor() {
        this.httpClient = new HttpClient(config.API_BASE_URL);
    }

    async getUsers(params = {}) {
        try {
            // ✅ LIMPIAR parámetros antes de enviar
            const cleanParams = this.cleanGetUsersParams(params);

            console.log('UserService: Obteniendo usuarios con filtros:', cleanParams);
            const response = await this.httpClient.get('/api/v1/users', cleanParams);
            console.log('UserService: Respuesta usuarios:', response);
            return response;
        } catch (error) {
            console.error('UserService: Error obteniendo usuarios:', error);
            throw error;
        }
    }

    // ✅ NUEVO: Método para limpiar parámetros
    cleanGetUsersParams(params) {
        const cleaned = {};

        // Solo agregar parámetros que tengan valores válidos
        if (params.page && params.page > 0) {
            cleaned.page = params.page;
        }

        if (params.page_size && params.page_size > 0 && params.page_size <= 100) {
            cleaned.page_size = params.page_size;
        }

        if (params.name && params.name.trim() !== '') {
            cleaned.name = params.name.trim();
        }

        if (params.email && params.email.trim() !== '' && this.isValidEmail(params.email)) {
            cleaned.email = params.email.trim();
        }

        if (params.phone && params.phone.trim() !== '' && params.phone.trim().length === 10) {
            cleaned.phone = params.phone.trim();
        }

        if (params.is_active !== null && params.is_active !== undefined) {
            cleaned.is_active = params.is_active;
        }

        if (params.role_id && params.role_id > 0) {
            cleaned.role_id = params.role_id;
        }

        if (params.business_id && params.business_id > 0) {
            cleaned.business_id = params.business_id;
        }

        if (params.created_at && params.created_at.trim() !== '') {
            cleaned.created_at = params.created_at.trim();
        }

        if (params.sort_by && params.sort_by.trim() !== '') {
            cleaned.sort_by = params.sort_by.trim();
        }

        if (params.sort_order && params.sort_order.trim() !== '') {
            cleaned.sort_order = params.sort_order.trim();
        }

        console.log('🔧 Parámetros originales:', params);
        console.log('✅ Parámetros limpiados:', cleaned);

        return cleaned;
    }

    // ✅ Helper para validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
            console.log('🗑️ UserService: Iniciando eliminación usuario ID:', id);
            console.log('🗑️ UserService: Tipo de ID:', typeof id);
            console.log('🌐 UserService: Base URL:', this.httpClient.baseURL);
            console.log('🌐 UserService: URL completa:', `${this.httpClient.baseURL}/api/v1/users/${id}`);

            // Verificar que tenemos token
            const token = localStorage.getItem('authToken');
            console.log('🔑 UserService: Token disponible:', !!token);
            if (token) {
                console.log('🔑 UserService: Token preview:', token.substring(0, 20) + '...');
            }

            const response = await this.httpClient.delete(`/api/v1/users/${id}`);

            console.log('✅ UserService: Respuesta eliminación:', response);
            console.log('✅ UserService: Success:', response.success);
            console.log('✅ UserService: Message:', response.message);

            return response;
        } catch (error) {
            console.error('❌ UserService: Error eliminando usuario:', error);
            console.error('❌ UserService: Error message:', error.message);
            console.error('❌ UserService: Error stack:', error.stack);

            // Agregar más contexto al error
            if (error.message.includes('404')) {
                console.error('🔍 UserService: Error 404 - Posibles causas:');
                console.error('   1. Usuario no existe (ID inválido)');
                console.error('   2. Ruta no configurada en backend');
                console.error('   3. Backend no está corriendo');
                console.error('   4. URL base incorrecta');
            }

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