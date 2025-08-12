import { useState, useCallback, useMemo } from 'react';
import { Table, CreateTableRequest, UpdateTableRequest } from '@/features/tables/domain/Table';
import { TableRepositoryHttp } from '@/features/tables/adapters/http/TableRepositoryHttp';
import { GetTablesUseCase } from '@/features/tables/application/GetTablesUseCase';
import { GetTableByIdUseCase } from '@/features/tables/application/GetTableByIdUseCase';
import { CreateTableUseCase } from '@/features/tables/application/CreateTableUseCase';
import { UpdateTableUseCase } from '@/features/tables/application/UpdateTableUseCase';
import { DeleteTableUseCase } from '@/features/tables/application/DeleteTableUseCase';

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const repository = useMemo(() => new TableRepositoryHttp(), []);
  const getTablesUseCase = useMemo(() => new GetTablesUseCase(repository), [repository]);
  const getTableByIdUseCase = useMemo(() => new GetTableByIdUseCase(repository), [repository]);
  const createTableUseCase = useMemo(() => new CreateTableUseCase(repository), [repository]);
  const updateTableUseCase = useMemo(() => new UpdateTableUseCase(repository), [repository]);
  const deleteTableUseCase = useMemo(() => new DeleteTableUseCase(repository), [repository]);

  const loadTables = useCallback(async () => {
    console.log('🔄 useTables: loadTables iniciado');
    setLoading(true);
    setError(null);
    try {
      const result = await getTablesUseCase.execute();
      console.log('✅ useTables: Mesas obtenidas:', result);
      setTables(result);
    } catch (err: any) {
      console.error('❌ useTables: Error al cargar mesas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 useTables: loadTables completado');
    }
  }, [getTablesUseCase]);

  const getTableById = useCallback(async (id: number) => {
    try {
      const table = await getTableByIdUseCase.execute(id);
      setSelectedTable(table);
      return table;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [getTableByIdUseCase]);

  const createTable = useCallback(async (tableData: CreateTableRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newTable = await createTableUseCase.execute(tableData);
      setTables(prev => [...prev, newTable]);
      return newTable;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createTableUseCase]);

  const updateTable = useCallback(async (id: number, tableData: UpdateTableRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTable = await updateTableUseCase.execute(id, tableData);
      setTables(prev => prev.map(table => 
        table.id === id ? updatedTable : table
      ));
      if (selectedTable?.id === id) {
        setSelectedTable(updatedTable);
      }
      return updatedTable;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateTableUseCase, selectedTable]);

  const deleteTable = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTableUseCase.execute(id);
      setTables(prev => prev.filter(table => table.id !== id));
      if (selectedTable?.id === id) {
        setSelectedTable(null);
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteTableUseCase, selectedTable]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelectedTable = useCallback(() => {
    setSelectedTable(null);
  }, []);

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
    clearError,
    clearSelectedTable,
    setSelectedTable
  };
};
