import { useState, useCallback, useMemo } from 'react';
import { Table } from '@/features/tables/domain/Table';
import { TableRepositoryHttp } from '@/features/tables/adapters/http/TableRepositoryHttp';
import { GetTablesUseCase } from '@/features/tables/application/GetTablesUseCase';

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new TableRepositoryHttp(), []);
  const useCase = useMemo(() => new GetTablesUseCase(repository), [repository]);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCase.execute();
      setTables(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  return { tables, loading, error, loadTables };
};
