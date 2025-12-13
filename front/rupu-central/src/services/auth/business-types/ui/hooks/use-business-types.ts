/**
 * Hook: useBusinessTypes
 * Hook personalizado para obtener tipos de negocio con paginación y filtros
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBusinessTypesAction } from '../../infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { BusinessType } from '../../domain/entities';

export interface UseBusinessTypesOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

export interface UseBusinessTypesResult {
  // Estado
  businessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
  
  // Paginación
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  
  // Filtros
  filters: {
    name?: string;
    code?: string;
    is_active?: boolean;
  };
  
  // Datos paginados y filtrados
  paginatedBusinessTypes: BusinessType[];
  
  // Acciones
  loadBusinessTypes: (token?: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<UseBusinessTypesResult['filters']>) => void;
  refresh: () => void;
}

export function useBusinessTypes(options: UseBusinessTypesOptions = {}): UseBusinessTypesResult {
  const {
    initialPage = 1,
    pageSize: initialPageSize = 10,
    autoLoad = false
  } = options;

  // Estado
  const [allBusinessTypes, setAllBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  
  // Filtros
  const [filters, setFiltersState] = useState<UseBusinessTypesResult['filters']>({});

  // Cargar business types
  const loadBusinessTypes = useCallback(async (authToken?: string) => {
    const token = authToken || TokenStorage.getBusinessToken();
    if (!token) {
      setError('Token de autenticación requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getBusinessTypesAction({ token });

      if (result.success && result.data) {
        setAllBusinessTypes(result.data.businessTypes || []);
      } else {
        setError(result.error || 'Error al obtener tipos de negocio');
        setAllBusinessTypes([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setAllBusinessTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  const filteredBusinessTypes = useMemo(() => {
    let filtered = [...allBusinessTypes];

    if (filters.name) {
      const nameLower = filters.name.toLowerCase();
      filtered = filtered.filter(bt => 
        bt.name.toLowerCase().includes(nameLower) ||
        (bt.code && bt.code.toLowerCase().includes(nameLower))
      );
    }

    if (filters.code) {
      const codeLower = filters.code.toLowerCase();
      filtered = filtered.filter(bt => 
        bt.code && bt.code.toLowerCase().includes(codeLower)
      );
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter(bt => bt.is_active === filters.is_active);
    }

    return filtered;
  }, [allBusinessTypes, filters]);

  // Calcular paginación
  const totalCount = filteredBusinessTypes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Obtener datos paginados
  const paginatedBusinessTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBusinessTypes.slice(startIndex, endIndex);
  }, [filteredBusinessTypes, currentPage, pageSize]);

  // Ajustar página actual si es necesario
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Cambiar página
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Cambiar tamaño de página
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset a la primera página
  }, []);

  // Cambiar filtros
  const setFilters = useCallback((newFilters: Partial<UseBusinessTypesResult['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset a la primera página
  }, []);

  // Refrescar datos
  const refresh = useCallback(() => {
    const currentToken = TokenStorage.getBusinessToken();
    if (currentToken) {
      loadBusinessTypes(currentToken);
    }
  }, [loadBusinessTypes]);

  // Auto-cargar si está habilitado
  useEffect(() => {
    if (autoLoad) {
      loadBusinessTypes();
    }
  }, [autoLoad, loadBusinessTypes]);

  return {
    // Estado
    businessTypes: paginatedBusinessTypes,
    loading,
    error,
    
    // Paginación
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    
    // Filtros
    filters,
    
    // Datos paginados
    paginatedBusinessTypes,
    
    // Acciones
    loadBusinessTypes,
    setPage,
    setPageSize,
    setFilters,
    refresh
  };
}
