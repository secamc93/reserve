'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../../internal/application/services/AuthService';
import { User, UserRolesPermissions } from '../../internal/domain/entities/User';
import { config } from '../../config/env';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRolesPermissions, setUserRolesPermissions] = useState<UserRolesPermissions | null>(null);

  const authService = new AuthService(config.API_BASE_URL);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authenticated = authService.isAuthenticated();
      const user = authService.getUserInfo();
      const rolesPermissions = typeof window !== 'undefined' ? localStorage.getItem('userRolesPermissions') : null;

      console.log('🔐 useAuth: Verificando estado de autenticación');
      console.log('🔐 useAuth: Autenticado:', authenticated);
      console.log('🔐 useAuth: Usuario:', user);
      console.log('🔐 useAuth: Roles y permisos:', rolesPermissions);

      setIsAuthenticated(authenticated);
      setUserInfo(user);
      setUserRolesPermissions(rolesPermissions ? JSON.parse(rolesPermissions) : null);
    } catch (error) {
      console.error('🔐 useAuth: Error verificando autenticación:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
      setUserRolesPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.login({ email, password });

      if (result.success) {
        // Verificar si requiere cambio de contraseña
        if (result.requirePasswordChange) {
          console.log('🔐 useAuth: Requiere cambio de contraseña, redirigiendo...');
          console.log('🔐 useAuth: Datos de respuesta:', result);
          
          // Guardar token temporalmente para el cambio de contraseña
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('userInfo', JSON.stringify(result.data.user));
          }
          
          // Redirigir a la página de cambio de contraseña
          window.location.href = '/change-password';
          return { success: true, requirePasswordChange: true };
        }

        // Intentar obtener roles y permisos
        try {
          const rolesPermissions = await authService.getUserRolesPermissions();
          if (typeof window !== 'undefined') {
            localStorage.setItem('userRolesPermissions', JSON.stringify(rolesPermissions));
          }
          setUserRolesPermissions(rolesPermissions);
          console.log('🔐 useAuth: Roles y permisos obtenidos:', rolesPermissions);
        } catch (rolesError) {
          console.warn('🔐 useAuth: No se pudieron obtener roles y permisos:', rolesError);
        }

        setIsAuthenticated(true);
        setUserInfo(result.user || null);
        return { success: true };
      }
    } catch (error) {
      console.error('🔐 useAuth: Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔐 useAuth: Cerrando sesión');
    authService.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
    setUserRolesPermissions(null);
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(userRolesPermissions, permission);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(userRolesPermissions, role);
  };

  const isSuperAdmin = (): boolean => {
    return authService.isSuperAdmin(userRolesPermissions);
  };

  const canManageResource = (resource: string): boolean => {
    if (!userRolesPermissions) return false;
    return userRolesPermissions.permissions.some(p =>
      p.resource === resource && p.action === 'manage'
    );
  };

  const canReadResource = (resource: string): boolean => {
    if (!userRolesPermissions) return false;
    return userRolesPermissions.permissions.some(p =>
      p.resource === resource && p.action === 'read'
    );
  };

  const getUserRoles = () => {
    return userRolesPermissions?.roles || [];
  };

  const getUserPermissions = () => {
    return userRolesPermissions?.permissions || [];
  };

  return {
    isAuthenticated,
    userInfo,
    loading,
    userRolesPermissions,
    login,
    logout,
    hasPermission,
    hasRole,
    isSuperAdmin,
    canManageResource,
    canReadResource,
    getUserRoles,
    getUserPermissions,
    checkAuthStatus
  };
}; 