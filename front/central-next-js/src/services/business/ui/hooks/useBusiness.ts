import { useState, useEffect, useCallback } from 'react';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../../domain/entities/Business';
import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../../domain/entities/Business';
import { 
  getBusinessesAction, 
  getBusinessByIdAction, 
  createBusinessAction, 
  updateBusinessAction, 
  deleteBusinessAction,
  getBusinessTypesAction 
} from '@/services/business/infrastructure/actions/business.actions';

export const useBusiness = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useBusiness] Llamando a getBusinessesAction...');
      const result = await getBusinessesAction();
      console.log('✅ [useBusiness] Resultado recibido:', result);
      
      if (result.success) {
        setBusinesses(result.data || []);
        console.log('✅ [useBusiness] Negocios cargados:', result.data?.length || 0);
      } else {
        setError(result.message || 'Error al cargar negocios');
        setBusinesses([]);
        console.log('❌ [useBusiness] Error al cargar negocios:', result.message);
      }
    } catch (err: any) {
      console.error('❌ [useBusiness] Error en loadBusinesses:', err);
      setError(err.message || 'Error de conexión');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBusinessTypes = useCallback(async () => {
    try {
      console.log('🔍 [useBusiness] Llamando a getBusinessTypesAction...');
      const result = await getBusinessTypesAction();
      console.log('✅ [useBusiness] Tipos de negocio recibidos:', result);
      
      if (result.success) {
        setBusinessTypes(result.data || []);
        console.log('✅ [useBusiness] Tipos de negocio cargados:', result.data?.length || 0);
      } else {
        console.log('❌ [useBusiness] Error al cargar tipos de negocio:', result.message);
      }
    } catch (err: any) {
      console.error('❌ [useBusiness] Error en loadBusinessTypes:', err);
    }
  }, []);

  const createBusiness = useCallback(async (businessData: CreateBusinessRequest | FormData): Promise<Business> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useBusiness] Llamando a createBusinessAction...');
      // Convertir CreateBusinessRequest a FormData si es necesario
      const formData = businessData instanceof FormData ? businessData : new FormData();
      if (!(businessData instanceof FormData)) {
        Object.entries(businessData).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
      }
      
      const result = await createBusinessAction(formData);
      console.log('✅ [useBusiness] Resultado de creación:', result);
      
      if (result.success && result.data) {
        const newBusiness = result.data;
        setBusinesses(prev => [...prev, newBusiness]);
        console.log('✅ [useBusiness] Negocio creado exitosamente');
        return newBusiness;
      } else {
        const errorMsg = result.message || 'Error al crear negocio';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useBusiness] Error en createBusiness:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusiness = useCallback(async (id: number, businessData: UpdateBusinessRequest | FormData): Promise<Business> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useBusiness] Llamando a updateBusinessAction...');
      // Convertir UpdateBusinessRequest a FormData si es necesario
      const formData = businessData instanceof FormData ? businessData : new FormData();
      if (!(businessData instanceof FormData)) {
        Object.entries(businessData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value as string);
          }
        });
      }
      
      const result = await updateBusinessAction(id, formData);
      console.log('✅ [useBusiness] Resultado de actualización:', result);
      
      if (result.success && result.data) {
        const updatedBusiness = result.data;
        setBusinesses(prev => prev.map(b => b.id === id ? updatedBusiness : b));
        console.log('✅ [useBusiness] Negocio actualizado exitosamente');
        return updatedBusiness;
      } else {
        const errorMsg = result.message || 'Error al actualizar negocio';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useBusiness] Error en updateBusiness:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBusiness = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useBusiness] Llamando a deleteBusinessAction...');
      const result = await deleteBusinessAction(id);
      console.log('✅ [useBusiness] Resultado de eliminación:', result);
      
      if (result.success) {
        setBusinesses(prev => prev.filter(b => b.id !== id));
        console.log('✅ [useBusiness] Negocio eliminado exitosamente');
      } else {
        const errorMsg = result.message || 'Error al eliminar negocio';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useBusiness] Error en deleteBusiness:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBusinessById = useCallback(async (id: number): Promise<Business> => {
    try {
      console.log('🔍 [useBusiness] Llamando a getBusinessByIdAction...');
      const result = await getBusinessByIdAction(id);
      console.log('✅ [useBusiness] Resultado de búsqueda por ID:', result);
      
      if (result.success && result.data) {
        const business = result.data;
        setSelectedBusiness(business);
        console.log('✅ [useBusiness] Negocio encontrado por ID');
        return business;
      } else {
        const errorMsg = result.message || 'Error al obtener negocio';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ [useBusiness] Error en getBusinessById:', err);
      setError(err.message || 'Error de conexión');
      throw err;
    }
  }, []);

  const createBusinessType = useCallback(async (businessTypeData: CreateBusinessTypeRequest): Promise<BusinessType> => {
    setLoading(true);
    setError(null);
    try {
      // This part of the logic needs to be adapted to use Server Actions
      // For now, it will remain as is, but it will not be directly callable
      // from this hook's return object as it's not part of the new_code.
      // If you need to call this from a component, you'd need to import
      // the action and call it directly.
      console.warn('createBusinessType action is not yet implemented for Server Actions.');
      return Promise.resolve({ 
        id: 0, 
        name: 'N/A', 
        code: 'N/A',
        description: 'N/A',
        icon: 'N/A',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as BusinessType); // Placeholder
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusinessType = useCallback(async (id: number, businessTypeData: UpdateBusinessTypeRequest): Promise<BusinessType> => {
    setLoading(true);
    setError(null);
    try {
      // This part of the logic needs to be adapted to use Server Actions
      // For now, it will remain as is, but it will not be directly callable
      // from this hook's return object as it's not part of the new_code.
      // If you need to call this from a component, you'd need to import
      // the action and call it directly.
      console.warn('updateBusinessType action is not yet implemented for Server Actions.');
      return Promise.resolve({ 
        id: 0, 
        name: 'N/A', 
        code: 'N/A',
        description: 'N/A',
        icon: 'N/A',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as BusinessType); // Placeholder
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBusinessType = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // This part of the logic needs to be adapted to use Server Actions
      // For now, it will remain as is, but it will not be directly callable
      // from this hook's return object as it's not part of the new_code.
      // If you need to call this from a component, you'd need to import
      // the action and call it directly.
      console.warn('deleteBusinessType action is not yet implemented for Server Actions.');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelectedBusiness = useCallback(() => {
    setSelectedBusiness(null);
  }, []);

  useEffect(() => {
    loadBusinesses();
    loadBusinessTypes();
  }, [loadBusinesses, loadBusinessTypes]);

  return {
    businesses,
    businessTypes,
    loading,
    error,
    selectedBusiness,
    loadBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessById,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
    clearError,
    clearSelectedBusiness,
  };
}; 