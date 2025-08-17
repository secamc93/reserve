import { Table, CreateTableRequest, UpdateTableRequest } from '@/services/tables/domain/entities/Table';

export interface TableRepository {
  getTables(): Promise<Table[]>;
  getTableById(id: number): Promise<Table | null>;
  createTable(table: CreateTableRequest): Promise<Table>;
  updateTable(id: number, table: UpdateTableRequest): Promise<Table>;
  deleteTable(id: number): Promise<boolean>;
}
