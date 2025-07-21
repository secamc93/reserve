// Infrastructure - Auth Service
import { HttpClient } from './HttpClient.js';
import { config } from '../../config/env.js';

export class AuthService {
  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
  }

  async login(email, password) {
    try {
      console.log('🔐 AuthService: Iniciando login');
      console.log('🔐 AuthService: Email:', email);

      const loginData = {
        email: email,
        password: password
      };

      console.log('🔐 AuthService: Enviando datos de login:', loginData);

      const response = await this.httpClient.post('/api/v1/auth/login', loginData);

      console.log('🔐 AuthService: Respuesta del servidor:', response);

      if (response.success && response.data) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));

        console.log('🔐 AuthService: Login exitoso, token guardado');
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        console.error('🔐 AuthService: Respuesta inválida del servidor');
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('🔐 AuthService: Error en login:', error);
      throw error;
    }
  }

  async getUserRolesPermissions() {
    try {
      console.log('🔐 AuthService: Obteniendo roles y permisos para usuario:');

      const response = await this.httpClient.get(`/api/v1/auth/roles-permissions`);

      console.log('🔐 AuthService: Respuesta de roles y permisos:', response);

      if (response.success && response.data) {
        return {
          success: true,
          isSuper: response.data.is_super,
          roles: response.data.roles || [],
          permissions: response.data.permissions || []
        };
      } else {
        console.error('🔐 AuthService: Respuesta inválida de roles y permisos');
        throw new Error('Respuesta inválida de roles y permisos');
      }
    } catch (error) {
      console.error('🔐 AuthService: Error obteniendo roles y permisos:', error);
      throw error;
    }
  }

  logout() {
    console.log('🔐 AuthService: Cerrando sesión');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRolesPermissions');
  }

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
} 