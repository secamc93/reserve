/**
 * Hook: useBusinessTypes
 * Hook personalizado para obtener tipos de negocio
 */

'use client';

import { useState, useEffect } from 'react';
import { getBusinessTypesAction } from '../../infrastructure/actions/business-types/get-business-types.action';
import { TokenStorage } from '@shared/config';

export interface BusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseBusinessTypesResult {
  businessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessTypes(): UseBusinessTypesResult {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No hay token de autenticación disponible');
        setLoading(false);
        return;
      }

      const result = await getBusinessTypesAction({ token });

      console.log('🔍 Hook - Resultado de getBusinessTypesAction:', result);

      if (result.success && result.data) {
        console.log('🔍 Hook - Data recibida:', result.data);
        console.log('🔍 Hook - BusinessTypes:', result.data.businessTypes);
        setBusinessTypes(result.data.businessTypes);
      } else {
        console.log('❌ Hook - Error en resultado:', result.error);
        setError(result.error || 'Error al obtener tipos de negocio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  return {
    businessTypes,
    loading,
    error,
    refetch: fetchBusinessTypes,
  };
}
