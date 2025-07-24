import { Table } from '../../domain/entities/Table.js';

export class GetTablesUseCase {
    constructor(tableRepository) {
        this.tableRepository = tableRepository;
    }

    async execute(params = {}) {
        try {
            console.log('GetTablesUseCase: Ejecutando con parámetros:', params);
            
            // Test de la entidad Table con datos simulados
            const testData = {
                "ID": 1,
                "BusinessID": 1,
                "Number": 1,
                "Capacity": 4,
                "CreatedAt": "2025-07-23T00:33:10.322616-05:00",
                "UpdatedAt": "2025-07-23T00:33:10.322616-05:00",
                "DeletedAt": null
            };
            const testTable = new Table(testData);
            console.log('GetTablesUseCase: Test Table creado:', testTable);
            
            // Obtener datos del repositorio
            const tablesData = await this.tableRepository.getTables(params);
            
            console.log('GetTablesUseCase: Datos crudos recibidos:', tablesData);
            console.log('GetTablesUseCase: Tipo de datos:', typeof tablesData, Array.isArray(tablesData));
            
            // Convertir datos a entidades Table
            const tables = tablesData.map(tableData => {
                console.log('GetTablesUseCase: Procesando mesa:', tableData);
                console.log('GetTablesUseCase: Tipo de tableData:', typeof tableData);
                const table = new Table(tableData);
                console.log('GetTablesUseCase: Mesa procesada:', table);
                return table;
            });
            
            console.log('GetTablesUseCase: Mesas obtenidas exitosamente:', tables.length);
            
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