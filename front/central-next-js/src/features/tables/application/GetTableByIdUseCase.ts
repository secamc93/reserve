import { Table } from '@/features/tables/domain/Table';
import { TableRepository } from '@/features/tables/ports/TableRepository';

export class GetTableByIdUseCase {
  constructor(private repository: TableRepository) {}

  async execute(id: number): Promise<Table | null> {
    try {
      return await this.repository.getTableById(id);
    } catch (error) {
      console.error('GetTableByIdUseCase: Error:', error);
      throw new Error('No se pudo obtener la mesa');
    }
  }
} 