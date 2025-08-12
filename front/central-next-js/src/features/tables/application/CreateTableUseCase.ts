import { Table, CreateTableRequest } from '@/features/tables/domain/Table';
import { TableRepository } from '@/features/tables/ports/TableRepository';

export class CreateTableUseCase {
  constructor(private repository: TableRepository) {}

  async execute(tableData: CreateTableRequest): Promise<Table> {
    try {
      // Validaciones básicas
      if (tableData.capacity <= 0) {
        throw new Error('La capacidad debe ser mayor a 0');
      }
      if (tableData.number <= 0) {
        throw new Error('El número de mesa debe ser mayor a 0');
      }
      if (tableData.businessId <= 0) {
        throw new Error('El ID del negocio es requerido');
      }

      return await this.repository.createTable(tableData);
    } catch (error) {
      console.error('CreateTableUseCase: Error:', error);
      throw error;
    }
  }
} 