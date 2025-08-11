import { Table } from '@/features/tables/domain/Table';
import { TableRepository } from '@/features/tables/ports/TableRepository';

export class GetTablesUseCase {
  constructor(private repository: TableRepository) {}

  async execute(): Promise<Table[]> {
    try {
      return await this.repository.getTables();
    } catch (error) {
      console.error('GetTablesUseCase: Error:', error);
      return [];
    }
  }
}
