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
          setResources(result.data.resources);
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

