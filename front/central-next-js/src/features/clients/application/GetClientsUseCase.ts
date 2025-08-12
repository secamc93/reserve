import { Client } from '@/features/clients/domain/Client';
import { ClientRepository } from '@/features/clients/ports/ClientRepository';

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
