import { useState, useEffect, useCallback } from 'react';
import { BusinessTypeService } from '../../infrastructure/api/BusinessTypeService.js';

export const useBusinessTypes = () => {
    const [businessTypes, setBusinessTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const businessTypeService = new BusinessTypeService();

    // Obtener todos los tipos de negocio
    const fetchBusinessTypes = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('useBusinessTypes: Obteniendo tipos de negocio con parámetros:', params);
            const response = await businessTypeService.getBusinessTypes(params);
            
            if (response.success && response.data) {
                setBusinessTypes(response.data.business_types || []);
                console.log('useBusinessTypes: Tipos de negocio obtenidos:', response.data.business_types?.length || 0);
            } else {
                throw new Error(response?.message || 'Error obteniendo tipos de negocio');
            }
        } catch (err) {
            console.error('useBusinessTypes: Error obteniendo tipos de negocio:', err);
            setError(err.message || 'Error obteniendo tipos de negocio');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar tipos de negocio al montar el componente
    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    // Limpiar error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        businessTypes,
        loading,
        error,
        fetchBusinessTypes,
        clearError
    };
}; 