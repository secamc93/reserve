import { Table, CreateTableRequest, UpdateTableRequest } from '@/features/tables/domain/Table';
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

  async getTableById(id: number): Promise<Table | null> {
    return await this.service.getTableById(id);
  }

  async createTable(table: CreateTableRequest): Promise<Table> {
    return await this.service.createTable(table);
  }

  async updateTable(id: number, table: UpdateTableRequest): Promise<Table> {
    return await this.service.updateTable(id, table);
  }

  async deleteTable(id: number): Promise<boolean> {
    return await this.service.deleteTable(id);
  }
}
