import { useState, useCallback, useEffect } from 'react';
import { Business } from '@/services/business/domain/entities/Business';
import { getBusinessesAction } from '@/services/business/infrastructure/actions/business.actions';

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useBusinesses] Llamando a getBusinessesAction...');
      const result = await getBusinessesAction();
      console.log('✅ [useBusinesses] Resultado recibido:', result);
      
      if (result.success) {
        setBusinesses(result.data || []);
        console.log('✅ [useBusinesses] Negocios cargados:', result.data?.length || 0);
      } else {
        setError(result.message || 'Error al cargar negocios');
        setBusinesses([]);
        console.log('❌ [useBusinesses] Error al cargar negocios:', result.message);
      }
    } catch (err: any) {
      console.error('❌ [useBusinesses] Error en loadBusinesses:', err);
      setError(err.message || 'Error de conexión');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar negocios automáticamente al montar el hook
  useEffect(() => {
    console.log('🚀 [useBusinesses] Hook montado, cargando negocios...');
    loadBusinesses();
  }, [loadBusinesses]);

  return { businesses, loading, error, loadBusinesses };
};
