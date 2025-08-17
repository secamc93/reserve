import { useState, useCallback, useMemo } from 'react';
import { Room } from '@/services/rooms/domain/Room';
import { RoomRepositoryHttp } from '@/features/rooms/adapters/http/RoomRepositoryHttp';
import { GetRoomsUseCase } from '@/services/rooms/application/GetRoomsUseCase';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new RoomRepositoryHttp(), []);
  const useCase = useMemo(() => new GetRoomsUseCase(repository), [repository]);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCase.execute();
      setRooms(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  return { rooms, loading, error, loadRooms };
};
