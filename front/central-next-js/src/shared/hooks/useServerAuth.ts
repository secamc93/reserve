'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { loginAction, logoutAction, checkAuthAction, getUserRolesPermissionsAction, changePasswordAction } from '@/services/auth/infrastructure/actions/auth.actions';
import { useDebugAuth } from './useDebugAuth';

export interface UserRolesPermissions {
  resources: Array<{
    id: number;
    name: string;
    code: string;
    actions: Array<{
      id: number;
      name: string;
      code: string;
    }>;
  }>;
  permissions: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  roles: Array<{
    id: number;
    name: string;
    code: string;
    description: string;
    level: number;
    is_system: boolean;
    scope_id: number;
    scope_name: string;
    scope_code: string;
  }>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  permissions: UserRolesPermissions | null;
  loading: boolean;
  error: string | null;
}

export const useServerAuth = () => {
  // Hook de debug para monitorear llamadas
  useDebugAuth('useServerAuth');

  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    permissions: null,
    loading: true,
    error: null
  });

  // Refs para evitar múltiples llamadas simultáneas
  const authCheckRef = useRef<boolean>(false);
  const permissionsCheckRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  // Verificar autenticación usando Server Action
  const checkAuth = useCallback(async () => {
    if (authCheckRef.current) {
      console.log('🔄 [useServerAuth] checkAuth ya se está ejecutando, saltando...');
      return { isAuthenticated: state.isAuthenticated, user: state.user };
    }

    console.log('🔍 [useServerAuth] Verificando autenticación...');
    authCheckRef.current = true;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const result = await checkAuthAction();
      console.log('✅ [useServerAuth] Verificación completada:', result);
      
      if (result.isAuthenticated) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: result.user || prev.user,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          loading: false
        }));
      }
      
      return result;
    } catch (error) {
      console.error('❌ [useServerAuth] Error verificando autenticación:', error);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        loading: false
      }));
      return { isAuthenticated: false, user: null };
    } finally {
      authCheckRef.current = false;
    }
  }, []);

  // Obtener roles y permisos usando Server Action
  const loadUserRolesPermissions = useCallback(async () => {
    if (permissionsCheckRef.current) {
      console.log('🔄 [useServerAuth] loadUserRolesPermissions ya se está ejecutando, saltando...');
      return state.permissions;
    }

    console.log('🔍 [useServerAuth] Iniciando loadUserRolesPermissions...');
    console.log('🔍 [useServerAuth] Estado actual:', {
      isAuthenticated: state.isAuthenticated,
      permissionsCheckRef: permissionsCheckRef.current,
      loading: state.loading,
      hasUser: !!state.user
    });
    
    if (!state.isAuthenticated) {
      console.log('🔍 [useServerAuth] Usuario no autenticado, saltando carga de permisos');
      return null;
    }

    if (!state.user) {
      console.log('🔍 [useServerAuth] No hay usuario en el estado, saltando carga de permisos');
      return null;
    }

    permissionsCheckRef.current = true;
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      console.log('🔍 [useServerAuth] Llamando a getUserRolesPermissionsAction...');
      const result = await getUserRolesPermissionsAction();
      console.log('🔍 [useServerAuth] Resultado recibido:', result);
      
      if (result.success && result.data) {
        console.log('✅ [useServerAuth] Permisos cargados exitosamente');
        console.log('📊 [useServerAuth] Estructura de permisos:', {
          hasResources: !!(result.data.resources && result.data.resources.length > 0),
          hasPermissions: !!(result.data.permissions && result.data.permissions.length > 0),
          hasRoles: !!(result.data.roles && result.data.roles.length > 0),
          resourcesCount: result.data.resources?.length || 0,
          permissionsCount: result.data.permissions?.length || 0,
          rolesCount: result.data.roles?.length || 0
        });
        
        // Agregar logging detallado de los datos recibidos
        console.log('🔍 [useServerAuth] Datos completos recibidos:', JSON.stringify(result.data, null, 2));
        
        setState(prev => ({
          ...prev,
          permissions: result.data as UserRolesPermissions,
          loading: false,
          error: null
        }));
        return result.data;
      } else {
        console.log('❌ [useServerAuth] Error al cargar permisos:', result.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Error al cargar permisos'
        }));
        return null;
      }
    } catch (error) {
      console.error('❌ [useServerAuth] Error en loadUserRolesPermissions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error interno';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    } finally {
      permissionsCheckRef.current = false;
    }
  }, [state.isAuthenticated, state.user]);

  // Login usando Server Action
  const login = useCallback(async (formData: FormData) => {
    if (state.loading) return { success: false, message: 'Ya hay una operación en curso' };
    
    console.log('🔐 [useServerAuth] Login iniciado...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await loginAction(formData);
      console.log('🔐 [useServerAuth] Resultado del login:', result);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: result.user,
          loading: false,
          error: null
        }));

        console.log('✅ [useServerAuth] Login exitoso, estado actualizado');
        console.log('🔍 [useServerAuth] Esperando que las cookies estén disponibles...');
        
        // Esperar un poco más para asegurar que las cookies estén disponibles
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔍 [useServerAuth] Intentando cargar permisos...');
        
        // Cargar permisos después del login exitoso
        try {
          const permissionsResult = await loadUserRolesPermissions();
          console.log('✅ [useServerAuth] Permisos cargados después del login:', permissionsResult);
        } catch (permissionsError) {
          console.error('❌ [useServerAuth] Error cargando permisos después del login:', permissionsError);
        }

        return result;
      } else {
        console.log('❌ [useServerAuth] Login falló:', result.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Error de autenticación'
        }));
        return result;
      }
    } catch (error) {
      console.error('💥 [useServerAuth] Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error interno';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.loading, loadUserRolesPermissions]);

  // Logout usando Server Action
  const logout = useCallback(async () => {
    if (state.loading) return { success: false, message: 'Ya hay una operación en curso' };
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await logoutAction();
      
      setState({
        isAuthenticated: false,
        user: null,
        permissions: null,
        loading: false,
        error: null
      });

      authCheckRef.current = false;
      permissionsCheckRef.current = false;
      initializedRef.current = false;

      return result;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.loading]);

  // Cambiar contraseña usando Server Action
  const changePassword = useCallback(async (formData: FormData) => {
    if (state.loading) return { success: false, message: 'Ya hay una operación en curso' };
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await changePasswordAction(formData);
      
      setState(prev => ({ ...prev, loading: false }));
      
      if (!result.success) {
        setState(prev => ({ ...prev, error: result.message || 'Error al cambiar contraseña' }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.loading]);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Forzar recarga de permisos (útil para debugging)
  const forceReloadPermissions = useCallback(async () => {
    console.log('🔄 [useServerAuth] Forzando recarga de permisos...');
    permissionsCheckRef.current = false;
    initializedRef.current = false;
    
    try {
      const result = await loadUserRolesPermissions();
      console.log('✅ [useServerAuth] Permisos recargados forzadamente:', result);
      return result;
    } catch (error) {
      console.error('❌ [useServerAuth] Error en recarga forzada de permisos:', error);
      return null;
    }
  }, [loadUserRolesPermissions]);

  // Verificar si tiene un permiso específico
  const hasPermission = useCallback((permissionCode: string): boolean => {
    if (!state.permissions) return false;
    
    if (state.permissions.resources) {
      for (const resource of state.permissions.resources) {
        if (resource.actions && Array.isArray(resource.actions)) {
          const hasAction = resource.actions.some((action: any) => action.code === permissionCode);
          if (hasAction) return true;
        }
      }
    }
    
    if (state.permissions.permissions) {
      return state.permissions.permissions.some((permission: any) => permission.code === permissionCode);
    }
    
    return false;
  }, [state.permissions]);

  // Verificar si tiene un rol específico
  const hasRole = useCallback((roleName: string): boolean => {
    if (!state.permissions || !state.permissions.roles) return false;
    return state.permissions.roles.some((role: any) => role.name === roleName);
  }, [state.permissions]);

  // Verificar si es super admin
  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('super_admin') || hasRole('admin');
  }, [hasRole]);

  // Inicializar autenticación
  const initializeAuth = useCallback(async () => {
    if (initializedRef.current) {
      console.log('🔄 [useServerAuth] Ya inicializado, saltando...');
      return;
    }

    console.log('🚀 [useServerAuth] Iniciando initializeAuth...');
    initializedRef.current = true;
    
    try {
      console.log('🔍 [useServerAuth] Llamando a checkAuth...');
      const authResult = await checkAuth();
      console.log('✅ [useServerAuth] checkAuth completado:', authResult);
      
      if (authResult.isAuthenticated && authResult.user) {
        console.log('🔍 [useServerAuth] Usuario autenticado, cargando permisos...');
        console.log('👤 [useServerAuth] Usuario completo:', authResult.user.email);
        console.log('🏢 [useServerAuth] Información del negocio disponible:', {
          hasBusinesses: !!(authResult.user.businesses && authResult.user.businesses.length > 0),
          businessCount: authResult.user.businesses?.length || 0,
          hasPrimaryColor: !!authResult.user.businesses?.[0]?.primary_color,
          hasNavbarImage: !!authResult.user.businesses?.[0]?.navbar_image_url
        });
        
        try {
          // Cargar permisos después de verificar autenticación
          const permissionsResult = await loadUserRolesPermissions();
          console.log('✅ [useServerAuth] Permisos cargados en initializeAuth:', permissionsResult);
        } catch (error) {
          console.error('❌ [useServerAuth] Error cargando permisos en initializeAuth:', error);
        }
      } else {
        console.log('🔍 [useServerAuth] Usuario no autenticado o sin datos, saltando carga de permisos');
      }
    } catch (error) {
      console.error('❌ [useServerAuth] Error en initializeAuth:', error);
    }
  }, [checkAuth, loadUserRolesPermissions]);

  // Memoizar valores derivados
  const memoizedState = useMemo(() => ({
    ...state,
    hasPermission,
    hasRole,
    isSuperAdmin
  }), [state, hasPermission, hasRole, isSuperAdmin]);

  // Ejecutar initializeAuth solo una vez al montar
  useEffect(() => {
    console.log('🚀 [useServerAuth] Hook montado, ejecutando initializeAuth...');
    initializeAuth();
  }, []); // Remover dependencias para evitar recreación

  // Cargar permisos automáticamente cuando el usuario cambie
  useEffect(() => {
    console.log('🔄 [useServerAuth] useEffect - Usuario cambió:', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      hasPermissions: !!state.permissions,
      permissionsCount: state.permissions ? 'presente' : 'ausente'
    });
    
    if (state.isAuthenticated && state.user && !state.permissions) {
      console.log('🔄 [useServerAuth] Usuario autenticado sin permisos, cargando...');
      loadUserRolesPermissions();
    }
  }, [state.isAuthenticated, state.user, state.permissions]);

  return {
    ...memoizedState,
    login,
    logout,
    checkAuth,
    loadUserRolesPermissions,
    changePassword,
    clearError,
    initializeAuth,
    hasPermission,
    hasRole,
    isSuperAdmin,
    forceReloadPermissions
  };
}; 