import { Table } from '@/features/tables/domain/Table';
import { TableRepository } from '@/features/tables/ports/TableRepository';
import { TableService } from './TableService';

export class TableRepositoryHttp implements TableRepository {
  private service: TableService;

  constructor() {
    this.service = new TableService();
  }

  async getTables(): Promise<Table[]> {
    return await this.service.getTables();
  }
}
