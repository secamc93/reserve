/**
 * Hook: usePermissions
 * Hook personalizado para gestionar permisos del usuario basados en recursos
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { TokenStorage } from '@shared/config';
import { getPermissionsAction } from '../../infrastructure/actions';
import { UserPermissions, RESOURCE_ROUTE_MAP } from '../../domain/entities';

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const businessToken = TokenStorage.getBusinessToken();
      const activeBusiness = TokenStorage.getActiveBusiness();

      if (!businessToken) {
        setError('No hay business token disponible');
        setLoading(false);
        return;
      }

      if (activeBusiness === null) {
        setError('No hay negocio activo');
        setLoading(false);
        return;
      }

      // Intentar obtener permisos del cache primero
      const cachedPermissions = TokenStorage.getUserPermissions();
      if (cachedPermissions) {
        setPermissions(cachedPermissions);
        setLoading(false);
      }

      // Consultar el endpoint
      const result = await getPermissionsAction({
        businessId: activeBusiness,
        token: businessToken,
      });

      if (result.success && result.data) {
        const userPermissions: UserPermissions = {
          isSuperAdmin: result.data.isSuperAdmin,
          roles: result.data.roles,
          resources: result.data.resources,
        };
        setPermissions(userPermissions);
        TokenStorage.setUserPermissions(userPermissions);
      } else {
        setError(result.error || 'Error al obtener permisos');
      }
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado al cargar permisos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Verifica si el usuario tiene acceso a un recurso específico
   */
  const hasResource = useCallback((resourceName: string): boolean => {
    if (!permissions) return false;
    if (permissions.isSuperAdmin) return true;

    return permissions.resources.some(
      (r) => r.resource === resourceName && r.active
    );
  }, [permissions]);

  /**
   * Verifica si el usuario tiene una acción específica en un recurso
   */
  const hasAction = useCallback((resourceName: string, action: string): boolean => {
    if (!permissions) return false;
    if (permissions.isSuperAdmin) return true;

    const resource = permissions.resources.find(
      (r) => r.resource === resourceName && r.active
    );

    if (!resource) return false;
    return resource.actions.includes(action);
  }, [permissions]);

  /**
   * Verifica si el usuario tiene acceso a una ruta específica
   */
  const hasRouteAccess = useCallback((path: string): boolean => {
    if (!permissions) return false;
    if (permissions.isSuperAdmin) return true;

    // Buscar en el mapeo de recursos a rutas
    for (const [resourceName, routes] of Object.entries(RESOURCE_ROUTE_MAP)) {
      // Verificar si la ruta coincide con alguna de las rutas del recurso
      const matches = routes.some((route) => {
        // Convertir rutas dinámicas a regex (cualquier parámetro entre corchetes)
        const routePattern = route.replace(/\[[^\]]+\]/g, '[^/]+');
        const regex = new RegExp(`^${routePattern.replace(/\//g, '\\/')}$`);
        return regex.test(path);
      });

      if (matches && hasResource(resourceName)) {
        return true;
      }
    }

    // Permitir acceso a rutas base que no requieren permisos específicos
    const publicRoutes = ['/home', '/login'];
    if (publicRoutes.includes(path)) {
      return true;
    }

    return false;
  }, [permissions, hasResource]);

  /**
   * Obtiene todas las acciones permitidas para un recurso
   */
  const getResourceActions = useCallback((resourceName: string): string[] => {
    if (!permissions) return [];
    if (permissions.isSuperAdmin) return ['Create', 'Read', 'Update', 'Delete'];

    const resource = permissions.resources.find(
      (r) => r.resource === resourceName && r.active
    );

    return resource?.actions || [];
  }, [permissions]);

  /**
   * Obtiene todos los recursos activos del usuario
   */
  const getActiveResources = useCallback((): string[] => {
    if (!permissions) return [];
    if (permissions.isSuperAdmin) return Object.keys(RESOURCE_ROUTE_MAP);

    return permissions.resources
      .filter((r) => r.active)
      .map((r) => r.resource);
  }, [permissions]);

  return {
    permissions,
    loading,
    error,
    hasResource,
    hasAction,
    hasRouteAccess,
    getResourceActions,
    getActiveResources,
    refresh: loadPermissions,
  };
}
