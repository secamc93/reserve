import { ClientRepository } from '@/features/clients/ports/ClientRepository';
import { Client, CreateClientDTO, UpdateClientDTO } from '@/features/clients/domain/Client';
import { ClientService } from './ClientService';

export class ClientRepositoryHttp implements ClientRepository {
  private service: ClientService;

  constructor() {
    this.service = new ClientService();
  }

  async getClients(): Promise<Client[]> {
    return await this.service.getClients();
  }

  async getClientById(id: number): Promise<Client> {
    return await this.service.getClientById(id);
  }

  async createClient(data: CreateClientDTO): Promise<{ success: boolean; message?: string }> {
    return await this.service.createClient(data);
  }

  async updateClient(id: number, data: UpdateClientDTO): Promise<{ success: boolean; message?: string }> {
    return await this.service.updateClient(id, data);
  }

  async deleteClient(id: number): Promise<{ success: boolean; message?: string }> {
    return await this.service.deleteClient(id);
  }
}
