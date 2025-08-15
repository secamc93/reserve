import { useState, useCallback, useMemo } from 'react';
import { Business } from '@/features/business/domain/Business';
import { BusinessRepositoryHttp } from '@/features/business/adapters/http/BusinessRepositoryHttp';
import { GetBusinessesUseCase } from '@/features/business/application/GetBusinessesUseCase';

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new BusinessRepositoryHttp(), []);
  const useCase = useMemo(() => new GetBusinessesUseCase(repository), [repository]);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCase.execute();
      setBusinesses(result); // result es directamente Business[]
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  return { businesses, loading, error, loadBusinesses };
};
