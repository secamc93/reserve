// Infrastructure - API Repository Implementation
import { ReservaRepository } from '../../domain/repositories/ReservaRepository.js';
import { Reserva } from '../../domain/entities/Reserva.js';
import { HttpClient } from '../api/HttpClient.js';
import { config } from '../../config/env.js';

export class ApiReservaRepository extends ReservaRepository {
  constructor() {
    super();
    this.httpClient = new HttpClient(config.API_BASE_URL);
    console.log('🔥 ApiReservaRepository initialized with base URL:', config.API_BASE_URL);
  }

  async getReservas(filters = {}) {
    try {
      console.log('Fetching reservas with filters:', filters);

      const params = {};

      // Map filters to API parameters
      if (filters.status_id) params.status_id = filters.status_id;
      if (filters.client_id) params.client_id = filters.client_id;
      if (filters.table_id) params.table_id = filters.table_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      console.log('API request params:', params);

      const response = await this.httpClient.get('/api/v1/reserves', params);

      console.log('API response:', response);

      // Validate response structure
      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.success) {
        throw new Error(response.message || 'API returned error status');
      }

      // Ensure data is an array
      const dataArray = Array.isArray(response.data) ? response.data : [];

      // Transform API response to domain entities
      const reservas = dataArray.map(reservaData => {
        try {
          return new Reserva(reservaData);
        } catch (entityError) {
          console.error('Error creating Reserva entity:', entityError, reservaData);
          return null;
        }
      }).filter(reserva => reserva !== null); // Filter out failed entities

      const result = {
        data: reservas,
        total: response.total || reservas.length,
        filters: response.filters || {},
        message: response.message || 'Reservas obtenidas exitosamente'
      };

      console.log('Processed result:', result);

      return result;
    } catch (error) {
      console.error('Error in ApiReservaRepository.getReservas:', error);

      // Return a safe default structure
      return {
        data: [],
        total: 0,
        filters: {},
        message: error.message || 'Error al obtener reservas'
      };
    }
  }

  async createReserva(reservaData) {
    try {
      console.log('Creating reserva with data:', reservaData);

      // Map front-end field to backend expectation
      const payload = { ...reservaData };
      if (payload.restaurant_id !== undefined) {
        payload.business_id = payload.restaurant_id;
        delete payload.restaurant_id;
      }

      const response = await this.httpClient.post('/api/v1/reserves', payload);

      console.log('Create reserva response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.success) {
        throw new Error(response.message || 'Error creating reserva');
      }

      // Transform response to domain entity if creation was successful
      return new Reserva(response.data);
    } catch (error) {
      console.error('Error creating reserva:', error);
      throw error;
    }
  }

  async getReservaById(id) {
    try {
      const response = await this.httpClient.get(`/api/v1/reserves/${id}`);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Error fetching reserva');
      }

      return new Reserva(response.data);
    } catch (error) {
      console.error('Error fetching reserva by ID:', error);
      throw error;
    }
  }

  async updateReservaStatus(id, status) {
    try {
      const response = await this.httpClient.put(`/api/v1/reserves/${id}/status`, {
        status: status
      });

      if (!response || !response.success) {
        throw new Error(response?.message || 'Error updating reserva status');
      }

      return new Reserva(response.data);
    } catch (error) {
      console.error('Error updating reserva status:', error);
      throw error;
    }
  }

  async cancelReserva(id) {
    try {
      console.log('🔥 INICIANDO CANCELACIÓN DE RESERVA');
      console.log('🔥 ID recibido:', id, 'Tipo:', typeof id);

      const reservaId = parseInt(id);
      if (isNaN(reservaId)) {
        throw new Error('ID de reserva inválido');
      }

      console.log('🔥 ID procesado:', reservaId);
      console.log('🔥 URL que se va a llamar:', `${config.API_BASE_URL}/api/v1/reserves/${reservaId}/cancel`);

      const response = await this.httpClient.patch(`/api/v1/reserves/${reservaId}/cancel`);

      console.log('🔥 RESPUESTA COMPLETA DEL BACKEND:', response);
      console.log('🔥 Tipo de respuesta:', typeof response);
      console.log('🔥 Keys de la respuesta:', Object.keys(response || {}));

      if (!response) {
        throw new Error('No response received from server');
      }

      console.log('🔥 response.success:', response.success);
      console.log('🔥 response.data:', response.data);
      console.log('🔥 Tipo de response.data:', typeof response.data);

      if (!response.success) {
        throw new Error(response.message || 'Error canceling reserva');
      }

      if (!response.data) {
        throw new Error('No data received in response');
      }

      console.log('🔥 Datos antes de crear Reserva entity:', response.data);
      console.log('🔥 Keys de response.data:', Object.keys(response.data || {}));

      // Transform response to domain entity if cancellation was successful
      const canceledReserva = new Reserva(response.data);
      console.log('🔥 Reserva entity creada:', canceledReserva);
      console.log('🔥 canceledReserva.reserva_id:', canceledReserva.reserva_id);

      return canceledReserva;
    } catch (error) {
      console.error('🔥 ERROR EN CANCELACIÓN:', error);
      console.error('🔥 Mensaje de error:', error.message);
      console.error('🔥 Stack trace:', error.stack);
      throw error;
    }
  }

  async assignTable(reservaId, tableId) {
    try {
      const response = await this.httpClient.put(`/api/v1/reserves/${reservaId}/table`, {
        table_id: tableId
      });

      if (!response || !response.success) {
        throw new Error(response?.message || 'Error assigning table');
      }

      return new Reserva(response.data);
    } catch (error) {
      console.error('Error assigning table:', error);
      throw error;
    }
  }
} 