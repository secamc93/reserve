import { TableRepository } from '@/features/tables/ports/TableRepository';

export class DeleteTableUseCase {
  constructor(private repository: TableRepository) {}

  async execute(id: number): Promise<boolean> {
    try {
      return await this.repository.deleteTable(id);
    } catch (error) {
      console.error('DeleteTableUseCase: Error:', error);
      throw new Error('No se pudo eliminar la mesa');
    }
  }
} 