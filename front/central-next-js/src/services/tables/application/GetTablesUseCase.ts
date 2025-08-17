import { Table } from '@/services/tables/domain/entities/Table';
import { TableRepository } from '@/services/tables/domain/ports/TableRepository';

export class GetTablesUseCase {
  constructor(private repository: TableRepository) {}

  async execute(): Promise<Table[]> {
    try {
      return await this.repository.getTables();
    } catch (error) {
      console.error('GetTablesUseCase: Error:', error);
      throw new Error('No se pudieron obtener las mesas');
    }
  }
}
