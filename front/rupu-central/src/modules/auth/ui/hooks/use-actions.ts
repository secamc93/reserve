/**
 * Hook para obtener actions
 */

'use client';

import { useState, useEffect } from 'react';
import { getActionsAction } from '../../infrastructure/actions/actions/get-actions.action';
import { TokenStorage } from '@shared/config';

export interface Action {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function useActions(nameFilter?: string) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActions();
  }, [nameFilter]);

  const loadActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

      const result = await getActionsAction({
        token,
        page: 1,
        page_size: 100, // Obtener todas las actions disponibles
        name: nameFilter,
      });

      if (result.success && result.data) {
        setActions(result.data.actions);
      } else {
        setError(result.error || 'Error al cargar actions');
      }
    } catch (err) {
      console.error('❌ Error al cargar actions:', err);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return { actions, loading, error, refetch: loadActions };
}

