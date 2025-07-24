import { useState, useEffect, useCallback } from 'react';
import { GetTablesUseCase } from '../../application/use-cases/GetTablesUseCase.js';
import { CreateTableUseCase } from '../../application/use-cases/CreateTableUseCase.js';
import { UpdateTableUseCase } from '../../application/use-cases/UpdateTableUseCase.js';
import { DeleteTableUseCase } from '../../application/use-cases/DeleteTableUseCase.js';
import { ApiTableRepository } from '../../infrastructure/adapters/ApiTableRepository.js';

export const useTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);

    // Inicializar repositorio y use cases
    const tableRepository = new ApiTableRepository();
    const getTablesUseCase = new GetTablesUseCase(tableRepository);
    const createTableUseCase = new CreateTableUseCase(tableRepository);
    const updateTableUseCase = new UpdateTableUseCase(tableRepository);
    const deleteTableUseCase = new DeleteTableUseCase(tableRepository);

    // Obtener todas las mesas
    const fetchTables = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useTables: Obteniendo mesas con parámetros:', params);
            const result = await getTablesUseCase.execute(params);
            
            console.log('useTables: Resultado del use case:', result);
            console.log('useTables: Datos del resultado:', result.data);
            
            setTables(result.data);
            console.log('useTables: Mesas obtenidas:', result.data.length);
        } catch (err) {
            console.error('useTables: Error obteniendo mesas:', err);
            setError(err.message || 'Error obteniendo mesas');
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nueva mesa
    const createTable = useCallback(async (tableData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useTables: Creando mesa:', tableData);
            const result = await createTableUseCase.execute(tableData);
            
            // Agregar la nueva mesa a la lista
            setTables(prev => [...prev, result.data]);
            
            console.log('useTables: Mesa creada exitosamente:', result.data.id);
            return result;
        } catch (err) {
            console.error('useTables: Error creando mesa:', err);
            setError(err.message || 'Error creando mesa');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar mesa existente
    const updateTable = useCallback(async (id, tableData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useTables: Actualizando mesa ID:', id, 'Datos:', tableData);
            const result = await updateTableUseCase.execute(id, tableData);
            
            // Actualizar la mesa en la lista
            setTables(prev => 
                prev.map(table => 
                    table.id === id ? result.data : table
                )
            );
            
            console.log('useTables: Mesa actualizada exitosamente:', result.data.id);
            return result;
        } catch (err) {
            console.error('useTables: Error actualizando mesa:', err);
            setError(err.message || 'Error actualizando mesa');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar mesa
    const deleteTable = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useTables: Eliminando mesa ID:', id);
            const result = await deleteTableUseCase.execute(id);
            
            // Remover la mesa de la lista
            setTables(prev => prev.filter(table => table.id !== id));
            
            console.log('useTables: Mesa eliminada exitosamente:', id);
            return result;
        } catch (err) {
            console.error('useTables: Error eliminando mesa:', err);
            setError(err.message || 'Error eliminando mesa');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Seleccionar mesa
    const selectTable = useCallback((table) => {
        setSelectedTable(table);
    }, []);

    // Limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedTable(null);
    }, []);

    // Limpiar error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Cargar mesas al montar el componente
    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    return {
        // Estado
        tables,
        loading,
        error,
        selectedTable,
        
        // Acciones
        fetchTables,
        createTable,
        updateTable,
        deleteTable,
        selectTable,
        clearSelection,
        clearError
    };
}; 