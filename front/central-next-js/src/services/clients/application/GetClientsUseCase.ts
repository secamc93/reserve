import { Client } from '@/services/clients/domain/entities/Client';
import { ClientRepository } from '@/services/clients/domain/ports/ClientRepository';

export class GetClientsUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    try {
      return await this.repository.getClients();
    } catch (error) {
      console.error('GetClientsUseCase: Error:', error);
      return [];
    }
  }
}
