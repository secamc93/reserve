'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { loginAction, logoutAction, checkAuthAction, getUserRolesPermissionsAction, changePasswordAction } from '@/server/actions/auth';
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
    
    if (!state.isAuthenticated) {
      console.log('🔍 [useServerAuth] Usuario no autenticado, saltando carga de permisos');
      return null;
    }

    permissionsCheckRef.current = true;
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await getUserRolesPermissionsAction();
      console.log('🔍 [useServerAuth] Resultado recibido:', result);
      
      if (result.success && result.data) {
        console.log('✅ [useServerAuth] Permisos cargados exitosamente');
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
  }, [state.isAuthenticated]);

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
        
        // Cargar permisos después del login exitoso
        setTimeout(() => {
          loadUserRolesPermissions();
        }, 100);

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
      const authResult = await checkAuth();
      
      if (authResult.isAuthenticated) {
        await loadUserRolesPermissions();
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
  }, []); // Sin dependencias para que solo se ejecute una vez

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
    isSuperAdmin
  };
}; 