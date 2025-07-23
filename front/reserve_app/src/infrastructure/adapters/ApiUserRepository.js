import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { User } from '../../domain/entities/User.js';
import { Role } from '../../domain/entities/Role.js';
import { UserService } from '../api/UserService.js';

export class ApiUserRepository extends UserRepository {
    constructor() {
        super();
        this.userService = new UserService();
        console.log('ApiUserRepository initialized');
    }

    async getUsers(filters = {}) {
        try {
            console.log('ApiUserRepository: Obteniendo usuarios con filtros:', filters);

            const response = await this.userService.getUsers(filters);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error fetching users');
            }

            const users = Array.isArray(response.data)
                ? response.data.map(userData => new User(userData))
                : [];

            return {
                success: true,
                data: users,
                total: response.total || users.length,
                page: response.page || 1,
                pageSize: response.page_size || users.length,
                message: response.message || 'Usuarios obtenidos exitosamente'
            };
        } catch (error) {
            console.error('ApiUserRepository: Error obteniendo usuarios:', error);
            return {
                success: false,
                data: [],
                total: 0,
                page: 1,
                pageSize: 10,
                message: error.message || 'Error al obtener usuarios'
            };
        }
    }

    async getUserById(id) {
        try {
            console.log('ApiUserRepository: Obteniendo usuario ID:', id);

            const response = await this.userService.getUserById(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error fetching user');
            }

            return {
                success: true,
                data: new User(response.data),
                message: response.message || 'Usuario obtenido exitosamente'
            };
        } catch (error) {
            console.error('ApiUserRepository: Error obteniendo usuario:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            console.log('ApiUserRepository: Creando usuario:', userData);
            const response = await this.userService.createUser(userData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error creating user');
            }

            // ✅ Capturar ID del usuario recién creado
            return {
                success: true,
                user_id: response.user_id,    // ✅ ID para usar inmediatamente
                email: response.email,
                password: response.password,
                message: response.message || 'Usuario creado exitosamente'
            };
        } catch (error) {
            console.error('ApiUserRepository: Error creando usuario:', error);
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            console.log('ApiUserRepository: Actualizando usuario ID:', id, 'Datos:', userData);

            const response = await this.userService.updateUser(id, userData);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error updating user');
            }

            return {
                success: true,
                data: new User(response.data),
                message: response.message || 'Usuario actualizado exitosamente'
            };
        } catch (error) {
            console.error('ApiUserRepository: Error actualizando usuario:', error);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            console.log('ApiUserRepository: Eliminando usuario ID:', id);

            const response = await this.userService.deleteUser(id);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error deleting user');
            }

            return {
                success: true,
                message: response.message || 'Usuario eliminado exitosamente'
            };
        } catch (error) {
            console.error('ApiUserRepository: Error eliminando usuario:', error);
            throw error;
        }
    }

    async getRoles() {
        try {
            console.log('ApiUserRepository: Obteniendo roles');

            const response = await this.userService.getRoles();

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error fetching roles');
            }

            const roles = Array.isArray(response.data)
                ? response.data.map(roleData => new Role(roleData))
                : [];

            return {
                success: true,
                data: roles,
                message: response.message || 'Roles obtenidos exitosamente'
            };
        } catch (error) {
            console.error('ApiUserRepository: Error obteniendo roles:', error);
            throw error;
        }
    }
} 