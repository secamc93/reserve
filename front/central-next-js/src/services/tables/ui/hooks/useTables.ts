import { useState, useCallback, useEffect } from 'react';
import { Table, CreateTableRequest, UpdateTableRequest } from '@/services/tables/domain/entities/Table';
import { 
  getTablesAction, 
  getTableByIdAction, 
  createTableAction, 
  updateTableAction, 
  deleteTableAction 
} from '@/services/tables/infrastructure/actions/tables.actions';

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const loadTables = useCallback(async () => {
    console.log('🔄 [useTables] loadTables iniciado');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useTables] Llamando a getTablesAction...');
      const result = await getTablesAction();
      console.log('✅ [useTables] Resultado recibido:', result);
      
      if (result.success) {
        setTables(result.data || []);
        console.log('✅ [useTables] Mesas cargadas:', result.data?.length || 0);
      } else {
        setError(result.message || 'Error al cargar mesas');
        setTables([]);
        console.log('❌ [useTables] Error al cargar mesas:', result.message);
      }
    } catch (err: any) {
      console.error('❌ [useTables] Error en loadTables:', err);
      setError(err.message || 'Error de conexión');
      setTables([]);
    } finally {
      setLoading(false);
      console.log('🏁 [useTables] loadTables completado');
    }
  }, []);

  const getTableById = useCallback(async (id: number) => {
    try {
      console.log('🔍 [useTables] Llamando a getTableByIdAction...');
      const result = await getTableByIdAction(id);
      console.log('✅ [useTables] Resultado de búsqueda por ID:', result);
      
      if (result.success && result.data) {
        const table = result.data;
        setSelectedTable(table);
        console.log('✅ [useTables] Mesa encontrada por ID');
        return table;
      } else {
        const errorMsg = result.message || 'Error al obtener mesa';
        setError(errorMsg);
        console.log('❌ [useTables] Error al obtener mesa:', errorMsg);
        return null;
      }
    } catch (err: any) {
      console.error('❌ [useTables] Error en getTableById:', err);
      setError(err.message || 'Error de conexión');
      return null;
    }
  }, []);

  const createTable = useCallback(async (tableData: CreateTableRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useTables] Llamando a createTableAction...');
      // Convertir CreateTableRequest a FormData
      const formData = new FormData();
      Object.entries(tableData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      const result = await createTableAction(formData);
      console.log('✅ [useTables] Resultado de creación:', result);
      
      if (result.success && result.data) {
        const newTable = result.data;
        setTables(prev => [...prev, newTable]);
        console.log('✅ [useTables] Mesa creada exitosamente');
        return newTable;
      } else {
        const errorMsg = result.message || 'Error al crear mesa';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useTables] Error en createTable:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTable = useCallback(async (id: number, tableData: UpdateTableRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useTables] Llamando a updateTableAction...');
      // Convertir UpdateTableRequest a FormData
      const formData = new FormData();
      Object.entries(tableData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      
      const result = await updateTableAction(id, formData);
      console.log('✅ [useTables] Resultado de actualización:', result);
      
      if (result.success && result.data) {
        const updatedTable = result.data;
        setTables(prev => prev.map(table => 
          table.id === id ? updatedTable : table
        ));
        if (selectedTable?.id === id) {
          setSelectedTable(updatedTable);
        }
        console.log('✅ [useTables] Mesa actualizada exitosamente');
        return updatedTable;
      } else {
        const errorMsg = result.message || 'Error al actualizar mesa';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useTables] Error en updateTable:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  const deleteTable = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useTables] Llamando a deleteTableAction...');
      const result = await deleteTableAction(id);
      console.log('✅ [useTables] Resultado de eliminación:', result);
      
      if (result.success) {
        setTables(prev => prev.filter(table => table.id !== id));
        if (selectedTable?.id === id) {
          setSelectedTable(null);
        }
        console.log('✅ [useTables] Mesa eliminada exitosamente');
        return true;
      } else {
        const errorMsg = result.message || 'Error al eliminar mesa';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useTables] Error en deleteTable:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar mesas automáticamente al montar el hook
  useEffect(() => {
    console.log('🚀 [useTables] Hook montado, cargando mesas...');
    loadTables();
  }, [loadTables]);

  return {
    tables,
    loading,
    error,
    selectedTable,
    loadTables,
    getTableById,
    createTable,
    updateTable,
    deleteTable,
    clearError
  };
};
