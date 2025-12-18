/**
 * Hook para obtener estadísticas del dashboard de propiedades horizontales
 */

'use client';

import { useState, useEffect } from 'react';
import { getDashboardStatsAction } from '../../infrastructure/actions';
import { DashboardStats } from '../../domain/entities';
import { TokenStorage } from '@shared/config';

interface UseDashboardStatsOptions {
  businessId?: number;
  page?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  currentPage: number;
  pageSize: number;
}

export function useDashboardStats(
  options: UseDashboardStatsOptions = {}
): UseDashboardStatsReturn {
  const { businessId, page: initialPage = 1, pageSize: initialPageSize = 10, autoLoad = true } = options;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const loadStats = async (page?: number, size?: number) => {
    setLoading(true);
    setError(null);

    try {
      const businessToken = TokenStorage.getBusinessToken();
      
      if (!businessToken) {
        throw new Error('No hay token de business disponible');
      }

      const pageToUse = page ?? currentPage;
      const sizeToUse = size ?? pageSize;

      // Si businessId es undefined, no pasarlo para obtener resumen de todas las propiedades (super admin)
      const result = await getDashboardStatsAction({
        token: businessToken,
        businessId: businessId,
        page: !businessId ? pageToUse : undefined, // Solo paginación si es super admin
        page_size: !businessId ? sizeToUse : undefined,
      });

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Error al obtener estadísticas del dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error cargando estadísticas del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPage = (page: number) => {
    setCurrentPage(page);
    if (!businessId) {
      loadStats(page, pageSize);
    }
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    if (!businessId) {
      loadStats(1, size);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadStats();
    }
  }, [businessId, autoLoad]);

  return {
    stats,
    loading,
    error,
    refresh: () => loadStats(),
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    currentPage,
    pageSize,
  };
}


