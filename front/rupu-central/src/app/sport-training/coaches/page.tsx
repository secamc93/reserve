/**
 * Coaches List Page
 * Página principal de gestión de entrenadores
 */
'use client';

import { useEffect, useState } from 'react';
import { CoachesTable } from '@/services/modules/sport-training/coaches/ui';
import { CoachesRepository } from '@/services/modules/sport-training/coaches/infrastructure/repositories/coaches.repository';
import { TokenStorage } from '@shared/config';
import { Spinner } from '@shared/ui';

export default function CoachesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCoaches = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();

      if (!token || !businessId) {
        setError('No se encontró token o business activo');
        setLoading(false);
        return;
      }

      try {
        const repo = new CoachesRepository();
        const result = await repo.getCoaches({
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

    loadCoaches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando entrenadores..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error al cargar entrenadores</p>
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
        {data && <CoachesTable initialData={data} businessId={businessId} />}
      </div>
    </div>
  );
}
