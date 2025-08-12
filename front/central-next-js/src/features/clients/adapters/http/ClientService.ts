import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';
import { Client, CreateClientDTO, UpdateClientDTO } from '@/features/clients/domain/Client';

export class ClientService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
  }

  async getClients(): Promise<Client[]> {
    const response = await this.httpClient.get('/api/v1/clients');
    const data = response.data || response.clients || response;
    return Array.isArray(data) ? data.map(this.mapClientFromBackend) : [];
  }

  async getClientById(id: number): Promise<Client> {
    const response = await this.httpClient.get(`/api/v1/clients/${id}`);
    const data = response.data || response.client || response;
    return this.mapClientFromBackend(data);
  }

  async createClient(client: CreateClientDTO): Promise<{ success: boolean; message?: string }> {
    const response = await this.httpClient.post('/api/v1/clients', {
      business_id: client.businessID,
      name: client.name,
      email: client.email,
      phone: client.phone,
      dni: client.dni
    });
    return { success: response.success !== false, message: response.message || 'Client created successfully' };
  }

  async updateClient(id: number, client: UpdateClientDTO): Promise<{ success: boolean; message?: string }> {
    const response = await this.httpClient.put(`/api/v1/clients/${id}`, {
      business_id: client.businessID,
      name: client.name,
      email: client.email,
      phone: client.phone,
      dni: client.dni
    });
    return { success: response.success !== false, message: response.message || 'Client updated successfully' };
  }

  async deleteClient(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await this.httpClient.delete(`/api/v1/clients/${id}`);
    return { success: response.success !== false, message: response.message || 'Client deleted successfully' };
  }

  private mapClientFromBackend(backend: any): Client {
    return {
      id: backend.id,
      businessID: backend.business_id,
      name: backend.name,
      email: backend.email,
      phone: backend.phone,
      dni: backend.dni,
      createdAt: backend.created_at,
      updatedAt: backend.updated_at,
      deletedAt: backend.deleted_at
    };
  }
}
