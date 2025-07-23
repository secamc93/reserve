import { Table } from '../../domain/entities/Table.js';

export class UpdateTableUseCase {
    constructor(tableRepository) {
        this.tableRepository = tableRepository;
    }

    async execute(id, tableData) {
        try {
            console.log('UpdateTableUseCase: Ejecutando para ID:', id, 'con datos:', tableData);
            
            // Validar ID
            if (!id) {
                throw new Error('ID de mesa es requerido');
            }
            
            // Crear entidad Table con datos de actualización
            const table = new Table({ ...tableData, id });
            
            // Enviar datos al repositorio
            const updatedTableData = await this.tableRepository.updateTable(id, table.toUpdateData());
            
            // Convertir respuesta a entidad
            const updatedTable = new Table(updatedTableData);
            
            console.log('UpdateTableUseCase: Mesa actualizada exitosamente:', updatedTable.id);
            
            return {
                success: true,
                data: updatedTable,
                message: 'Mesa actualizada exitosamente'
            };
        } catch (error) {
            console.error('UpdateTableUseCase: Error actualizando mesa:', error);
            throw error;
        }
    }
} 