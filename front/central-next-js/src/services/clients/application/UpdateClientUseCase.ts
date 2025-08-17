import { ClientRepository } from '@/services/clients/domain/ports/ClientRepository';
import { UpdateClientDTO } from '@/services/clients/domain/entities/Client';

export class UpdateClientUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(id: number, data: UpdateClientDTO): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.repository.updateClient(id, data);
    } catch (error) {
      console.error('UpdateClientUseCase: Error:', error);
      throw error;
    }
  }
}
