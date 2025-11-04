'use client';

import { useState, useEffect } from 'react';
import { getResourcesAction } from '../../infrastructure/actions';
import { TokenStorage } from '@shared/config';

export interface Resource {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useResources(businessTypeId?: number) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = TokenStorage.getToken();
        if (!token) {
          setError('No hay token disponible');
          return;
        }

        const result = await getResourcesAction({
          token,
          page: 1,
          pageSize: 1000, // Obtener todos los recursos
          business_type_id: businessTypeId,
        });

        if (result.success && result.data) {
          // Normalizar fechas a Date y claves a camelCase
          const normalized = (result.data.resources as any[]).map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description ?? '',
            createdAt: new Date(r.created_at ?? r.createdAt),
            updatedAt: new Date(r.updated_at ?? r.updatedAt),
          }));
          setResources(normalized);
        } else {
          setError(result.error || 'Error al cargar recursos');
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Error inesperado al cargar recursos');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [businessTypeId]);

  return { resources, loading, error };
}

