import { useState, useEffect } from 'react';
import { AuthService } from '../../infrastructure/api/AuthService.js';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRolesPermissions, setUserRolesPermissions] = useState(null);

  const authService = new AuthService();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authenticated = authService.isAuthenticated();
      const user = authService.getUserInfo();
      const rolesPermissions = localStorage.getItem('userRolesPermissions');

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

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);

      if (result.success) {
        // Intentar obtener roles y permisos
        try {
          const rolesPermissions = await authService.getUserRolesPermissions();
          localStorage.setItem('userRolesPermissions', JSON.stringify(rolesPermissions));
          setUserRolesPermissions(rolesPermissions);
          console.log('🔐 useAuth: Roles y permisos obtenidos:', rolesPermissions);
        } catch (rolesError) {
          console.warn('🔐 useAuth: No se pudieron obtener roles y permisos:', rolesError);
        }

        setIsAuthenticated(true);
        setUserInfo(result.user);
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

  const hasPermission = (permission) => {
    if (!userRolesPermissions || !userRolesPermissions.permissions) {
      return false;
    }

    return userRolesPermissions.permissions.some(p => p.code === permission);
  };

  const hasRole = (role) => {
    if (!userRolesPermissions || !userRolesPermissions.roles) {
      return false;
    }

    return userRolesPermissions.roles.some(r => r.code === role);
  };

  const isSuperAdmin = () => {
    return userRolesPermissions?.isSuper === true;
  };

  const canManageResource = (resource) => {
    if (!userRolesPermissions || !userRolesPermissions.permissions) {
      return false;
    }

    return userRolesPermissions.permissions.some(p =>
      p.resource === resource && p.action === 'manage'
    );
  };

  const canReadResource = (resource) => {
    if (!userRolesPermissions || !userRolesPermissions.permissions) {
      return false;
    }

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