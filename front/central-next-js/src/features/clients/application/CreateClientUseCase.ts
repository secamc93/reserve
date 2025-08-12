import { ClientRepository } from '@/features/clients/ports/ClientRepository';
import { CreateClientDTO } from '@/features/clients/domain/Client';

export class CreateClientUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(data: CreateClientDTO): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.repository.createClient(data);
    } catch (error) {
      console.error('CreateClientUseCase: Error:', error);
      throw error;
    }
  }
}
