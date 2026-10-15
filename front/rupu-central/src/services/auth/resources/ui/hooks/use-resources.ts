/**
 * Hook: useResources
 * Hook personalizado para obtener y gestionar recursos
 */

'use client';

import { useState, useEffect } from 'react';
import { getResourcesAction } from '../../infrastructure/actions';
import { fetchAllPages } from '@shared/utils/pagination';
import { TokenStorage } from '@shared/config';
import type { Resource } from '../../domain/entities';

export interface ResourceUI {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useResources(businessTypeId?: number) {
  const [resources, setResources] = useState<ResourceUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = TokenStorage.getBusinessToken();
        if (!token) {
          setError('No hay token disponible');
          return;
        }

        // Todos los recursos, en páginas de 200 (máximo del back).
        const all = await fetchAllPages(async (page, pageSize) => {
          const res = await getResourcesAction({ token, page, pageSize, business_type_id: businessTypeId });
          if (!res.success || !res.data) throw new Error(res.error || 'Error al cargar recursos');
          return { items: res.data.resources, total: res.data.total, totalPages: res.data.totalPages };
        });
        // Normalizar fechas a Date y claves a camelCase
        setResources(all.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? '',
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })));
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err instanceof Error ? err.message : 'Error inesperado al cargar recursos');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [businessTypeId]);

  return { resources, loading, error };
}
