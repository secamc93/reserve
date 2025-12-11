/**
 * Hook para obtener estadísticas del dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { getDashboardStatsAction } from '../../infrastructure/actions';
import { DashboardStats } from '../../domain/entities';
import { TokenStorage } from '@shared/config';

interface UseDashboardOptions {
  autoLoad?: boolean;
  business_type_id?: number;
  business_id?: number;
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { autoLoad = true, business_type_id, business_id } = options;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('Token de autenticación requerido');
        setLoading(false);
        return;
      }

      const result = await getDashboardStatsAction({
        token,
        business_type_id,
        business_id,
      });

      if (result.success && result.data) {
        setStats(result.data as DashboardStats);
      } else {
        setError(result.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, business_type_id, business_id]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}
