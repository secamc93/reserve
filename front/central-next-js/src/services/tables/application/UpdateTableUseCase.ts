import { Table, UpdateTableRequest } from '@/services/tables/domain/entities/Table';
import { TableRepository } from '@/services/tables/domain/ports/TableRepository';

export class UpdateTableUseCase {
  constructor(private repository: TableRepository) {}

  async execute(id: number, tableData: UpdateTableRequest): Promise<Table> {
    try {
      // Validaciones básicas
      if (tableData.capacity !== undefined && tableData.capacity <= 0) {
        throw new Error('La capacidad debe ser mayor a 0');
      }
      if (tableData.number !== undefined && tableData.number <= 0) {
        throw new Error('El número de mesa debe ser mayor a 0');
      }

      return await this.repository.updateTable(id, tableData);
    } catch (error) {
      console.error('UpdateTableUseCase: Error:', error);
      throw error;
    }
  }
} 