import { useState, useCallback, useMemo } from 'react';
import { Client, CreateClientDTO, UpdateClientDTO } from '@/features/clients/domain/Client';
import { ClientRepositoryHttp } from '@/features/clients/adapters/http/ClientRepositoryHttp';
import { GetClientsUseCase } from '@/features/clients/application/GetClientsUseCase';
import { CreateClientUseCase } from '@/features/clients/application/CreateClientUseCase';
import { UpdateClientUseCase } from '@/features/clients/application/UpdateClientUseCase';
import { DeleteClientUseCase } from '@/features/clients/application/DeleteClientUseCase';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new ClientRepositoryHttp(), []);
  const getUseCase = useMemo(() => new GetClientsUseCase(repository), [repository]);
  const createUseCase = useMemo(() => new CreateClientUseCase(repository), [repository]);
  const updateUseCase = useMemo(() => new UpdateClientUseCase(repository), [repository]);
  const deleteUseCase = useMemo(() => new DeleteClientUseCase(repository), [repository]);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUseCase.execute();
      setClients(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getUseCase]);

  const createClient = useCallback(async (data: CreateClientDTO) => {
    const result = await createUseCase.execute(data);
    await loadClients();
    return result;
  }, [createUseCase, loadClients]);

  const updateClient = useCallback(async (id: number, data: UpdateClientDTO) => {
    const result = await updateUseCase.execute(id, data);
    await loadClients();
    return result;
  }, [updateUseCase, loadClients]);

  const deleteClient = useCallback(async (id: number) => {
    const result = await deleteUseCase.execute(id);
    await loadClients();
    return result;
  }, [deleteUseCase, loadClients]);

  return { clients, loading, error, loadClients, createClient, updateClient, deleteClient };
};
