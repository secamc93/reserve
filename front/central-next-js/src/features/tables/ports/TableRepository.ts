import { Table } from '@/features/tables/domain/Table';

export interface TableRepository {
  getTables(): Promise<Table[]>;
}
