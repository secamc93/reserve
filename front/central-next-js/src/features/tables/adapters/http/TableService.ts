import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';
import { Table, CreateTableRequest, UpdateTableRequest } from '@/features/tables/domain/Table';

export class TableService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
  }

  async getTables(): Promise<Table[]> {
    console.log('🔄 TableService: getTables iniciado');
    try {
      const response = await this.httpClient.get('/api/v1/tables');
      console.log('✅ TableService: Respuesta recibida:', response);
      return response.data || [];
    } catch (error) {
      console.error('❌ TableService: Error en getTables:', error);
      throw error;
    }
  }

  async getTableById(id: number): Promise<Table | null> {
    const response = await this.httpClient.get(`/api/v1/tables/${id}`);
    return response.data || null;
  }

  async createTable(table: CreateTableRequest): Promise<Table> {
    const response = await this.httpClient.post('/api/v1/tables', table);
    return response.data;
  }

  async updateTable(id: number, table: UpdateTableRequest): Promise<Table> {
    const response = await this.httpClient.put(`/api/v1/tables/${id}`, table);
    return response.data;
  }

  async deleteTable(id: number): Promise<boolean> {
    await this.httpClient.delete(`/api/v1/tables/${id}`);
    return true;
  }
}
