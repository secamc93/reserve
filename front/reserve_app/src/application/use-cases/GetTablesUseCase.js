import { Table } from '../../domain/entities/Table.js';

export class GetTablesUseCase {
    constructor(tableRepository) {
        this.tableRepository = tableRepository;
    }

    async execute(params = {}) {
        try {
            console.log('GetTablesUseCase: Ejecutando con parámetros:', params);
            
            const tablesData = await this.tableRepository.getTables(params);
            
            // Convertir datos a entidades Table
            const tables = tablesData.map(tableData => new Table(tableData));
            
            console.log('GetTablesUseCase: Mesas obtenidas:', tables.length);
            
            return {
                success: true,
                data: tables,
                total: tables.length
            };
        } catch (error) {
            console.error('GetTablesUseCase: Error obteniendo mesas:', error);
            throw error;
        }
    }
} 