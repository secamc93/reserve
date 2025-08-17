import { ClientRepository } from '@/services/clients/domain/ports/ClientRepository';

export class DeleteClientUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      return await this.repository.deleteClient(id);
    } catch (error) {
      console.error('DeleteClientUseCase: Error:', error);
      throw error;
    }
  }
}
