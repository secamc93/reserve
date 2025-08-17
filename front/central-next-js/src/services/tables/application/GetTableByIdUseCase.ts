import { Table } from '@/services/tables/domain/entities/Table';
import { TableRepository } from '@/services/tables/domain/ports/TableRepository';

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