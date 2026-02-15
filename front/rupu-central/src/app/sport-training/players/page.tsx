/**
 * Players List Page
 * Página principal de gestión de jugadores
 */
'use client';

import { useEffect, useState } from 'react';
import { PlayersTable } from '@/services/modules/sport-training/players/ui';
import { PlayersRepository } from '@/services/modules/sport-training/players/infrastructure/repositories/players.repository';
import { TokenStorage } from '@shared/config';
import { Spinner } from '@shared/ui';

export default function PlayersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayers = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();

      if (!token || !businessId) {
        setError('No se encontró token o business activo');
        setLoading(false);
        return;
      }

      try {
        const repo = new PlayersRepository();
        const result = await repo.getPlayers({
          businessId,
          token,
          page: 1,
          pageSize: 10,
        });

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando jugadores..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error al cargar jugadores</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const businessId = TokenStorage.getActiveBusiness();

  if (!businessId) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No se encontró business activo
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {data && <PlayersTable initialData={data} businessId={businessId} />}
      </div>
    </div>
  );
}
