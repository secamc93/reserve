import { useState, useEffect, useCallback } from 'react';
import { GetBusinessesUseCase } from '../../application/use-cases/GetBusinessesUseCase.js';
import { CreateBusinessUseCase } from '../../application/use-cases/CreateBusinessUseCase.js';
import { UpdateBusinessUseCase } from '../../application/use-cases/UpdateBusinessUseCase.js';
import { DeleteBusinessUseCase } from '../../application/use-cases/DeleteBusinessUseCase.js';
import { ApiBusinessRepository } from '../../infrastructure/adapters/ApiBusinessRepository.js';

export const useBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    // Inicializar repositorio y use cases
    const businessRepository = new ApiBusinessRepository();
    const getBusinessesUseCase = new GetBusinessesUseCase(businessRepository);
    const createBusinessUseCase = new CreateBusinessUseCase(businessRepository);
    const updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository);
    const deleteBusinessUseCase = new DeleteBusinessUseCase(businessRepository);

    // Obtener todos los negocios
    const fetchBusinesses = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useBusinesses: Obteniendo negocios con parámetros:', params);
            const result = await getBusinessesUseCase.execute(params);
            
            setBusinesses(result.data);
            console.log('useBusinesses: Negocios obtenidos:', result.data.length);
        } catch (err) {
            console.error('useBusinesses: Error obteniendo negocios:', err);
            setError(err.message || 'Error obteniendo negocios');
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nuevo negocio
    const createBusiness = useCallback(async (businessData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useBusinesses: Creando negocio:', businessData);
            const result = await createBusinessUseCase.execute(businessData);
            
            // Agregar el nuevo negocio a la lista
            setBusinesses(prev => [...prev, result.data]);
            
            console.log('useBusinesses: Negocio creado exitosamente:', result.data.id);
            return result;
        } catch (err) {
            console.error('useBusinesses: Error creando negocio:', err);
            setError(err.message || 'Error creando negocio');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar negocio existente
    const updateBusiness = useCallback(async (id, businessData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useBusinesses: Actualizando negocio ID:', id, 'Datos:', businessData);
            const result = await updateBusinessUseCase.execute(id, businessData);
            
            // Actualizar el negocio en la lista
            setBusinesses(prev => 
                prev.map(business => 
                    business.id === id ? result.data : business
                )
            );
            
            console.log('useBusinesses: Negocio actualizado exitosamente:', result.data.id);
            return result;
        } catch (err) {
            console.error('useBusinesses: Error actualizando negocio:', err);
            setError(err.message || 'Error actualizando negocio');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar negocio
    const deleteBusiness = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useBusinesses: Eliminando negocio ID:', id);
            const result = await deleteBusinessUseCase.execute(id);
            
            // Remover el negocio de la lista
            setBusinesses(prev => prev.filter(business => business.id !== id));
            
            console.log('useBusinesses: Negocio eliminado exitosamente:', id);
            return result;
        } catch (err) {
            console.error('useBusinesses: Error eliminando negocio:', err);
            setError(err.message || 'Error eliminando negocio');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Seleccionar negocio
    const selectBusiness = useCallback((business) => {
        setSelectedBusiness(business);
    }, []);

    // Limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedBusiness(null);
    }, []);

    // Limpiar error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Cargar negocios al montar el componente
    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    return {
        // Estado
        businesses,
        loading,
        error,
        selectedBusiness,
        
        // Acciones
        fetchBusinesses,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        selectBusiness,
        clearSelection,
        clearError
    };
}; 