import { Table } from '../../domain/entities/Table.js';

export class CreateTableUseCase {
    constructor(tableRepository) {
        this.tableRepository = tableRepository;
    }

    async execute(tableData) {
        try {
            console.log('CreateTableUseCase: Ejecutando con datos:', tableData);
            
            // Validar datos requeridos
            if (!tableData.business_id || !tableData.number || !tableData.capacity) {
                throw new Error('ID de negocio, número y capacidad son requeridos');
            }
            
            // Crear entidad Table
            const table = new Table(tableData);
            
            // Validar que la entidad sea válida
            if (!table.isValid()) {
                throw new Error('Datos de mesa inválidos');
            }
            
            // Enviar datos al repositorio
            const createdTableData = await this.tableRepository.createTable(table.toCreateData());
            
            // Convertir respuesta a entidad
            const createdTable = new Table(createdTableData);
            
            console.log('CreateTableUseCase: Mesa creada exitosamente:', createdTable.id);
            
            return {
                success: true,
                data: createdTable,
                message: 'Mesa creada exitosamente'
            };
        } catch (error) {
            console.error('CreateTableUseCase: Error creando mesa:', error);
            throw error;
        }
    }
} 