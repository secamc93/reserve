/**
 * Hook para manejar la lista de usuarios
 * Aplica estilos globales y usa actions de usuarios
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsersAction, GetUsersInput, GetUsersResult } from '../../infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { usePaginationParams } from '@shared/ui/pagination';

export interface UseUsersOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

export interface UseUsersReturn {
  // Estado
  users: any[];
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
    email?: string;
    phone?: string;
    is_active?: boolean;
    role_id?: number;
    business_id?: number;
  };
  
  // Acciones
  loadUsers: (token: string, options?: Partial<GetUsersInput>) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<UseUsersReturn['filters']>) => void;
  refresh: () => void;
}

export function useUsers(options: UseUsersOptions = {}) {
  // initialPage/pageSize se ignoran: la paginación sale de la URL.
  const { autoLoad = false } = options;

  // Estado
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación: page/page_size viven en la URL (?page=&page_size=)
  const { page: currentPage, pageSize, setPage: setUrlPage, setPageSize: setUrlPageSize } = usePaginationParams();
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtros
  const [filters, setFiltersState] = useState<UseUsersReturn['filters']>({});
  
  // Token (debería venir de un contexto de auth)
  const [token, setToken] = useState<string | null>(null);

  // Cargar usuarios
  const loadUsers = useCallback(async (authToken?: string, options?: Partial<GetUsersInput>) => {
    const token = authToken || TokenStorage.getBusinessToken();
    if (!token) {
      setError('Token de autenticación requerido');
      return;
    }

    setLoading(true);
    setError(null);
    setToken(token);

    try {
      const params: GetUsersInput = {
        page: currentPage,
        page_size: pageSize,
        token: token, // ← Token se pasa como parámetro a la action
        ...filters,
        ...options
      };

      const result = await getUsersAction(params);

      if (result.success && result.data) {
        setUsers(result.data.users || []);
        setTotalPages(result.data.total_pages || 0);
        setTotalCount(result.data.count || 0);
      } else {
        // Si es error 401, limpiar sesión y redirigir
        if (result.error?.includes('401') || result.error?.includes('Token JWT inválido')) {
          TokenStorage.clearSession();
          window.location.href = '/login';
          return;
        }
        setError(result.error || 'Error al cargar usuarios');
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Si es error 401, limpiar sesión y redirigir
      if (errorMessage.includes('401') || errorMessage.includes('Token JWT inválido')) {
        TokenStorage.clearSession();
        window.location.href = '/login';
        return;
      }
      
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Cambiar página
  const setPage = useCallback((page: number) => {
    setUrlPage(page);
  }, [setUrlPage]);

  // Cambiar tamaño de página
  const setPageSize = useCallback((size: number) => {
    setUrlPageSize(size); // vuelve a la página 1
  }, [setUrlPageSize]);

  // Cambiar filtros
  const setFilters = useCallback((newFilters: Partial<UseUsersReturn['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setUrlPage(1); // Reset a la primera página
  }, [setUrlPage]);

  // Refrescar datos
  const refresh = useCallback(() => {
    const currentToken = TokenStorage.getBusinessToken();
    if (currentToken) {
      loadUsers(currentToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-cargar si está habilitado
  useEffect(() => {
    if (autoLoad && token) {
      loadUsers(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, token]);

  // Recargar cuando cambien los parámetros
  useEffect(() => {
    if (token) {
      loadUsers(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, filters, token]);

  return {
    // Estado
    users,
    loading,
    error,
    
    // Paginación
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    
    // Filtros
    filters,
    
    // Acciones
    loadUsers,
    setPage,
    setPageSize,
    setFilters,
    refresh
  };
}
