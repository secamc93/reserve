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
        // Verificar si requiere cambio de contraseña
        if (result.data && result.data.require_password_change === true) {
          console.log('🔐 useAuth: Requiere cambio de contraseña, redirigiendo...');
          console.log('🔐 useAuth: Datos de respuesta:', result);
          
          // Guardar token temporalmente para el cambio de contraseña
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('userInfo', JSON.stringify(result.data.user));
          
          // Redirigir a la página de cambio de contraseña
          window.location.href = '/change-password';
          return { success: true, requirePasswordChange: true };
        }

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

  // Función para obtener todos los permisos como array plano
  const getAllPermissions = () => {
    if (!userRolesPermissions) {
      return [];
    }

    // Los permisos están directamente en userRolesPermissions.permissions
    return userRolesPermissions.permissions || [];
  };

  const hasPermission = (permission) => {
    const allPermissions = getAllPermissions();
    const hasPerm = allPermissions.some(p => p.code === permission);
    
    console.log(`🔐 useAuth Debug - hasPermission("${permission}"):`, hasPerm);
    console.log(`🔐 useAuth Debug - Permisos disponibles:`, allPermissions.map(p => p.code));
    
    return hasPerm;
  };

  const hasRole = (role) => {
    if (!userRolesPermissions || !userRolesPermissions.roles) {
      return false;
    }

    return userRolesPermissions.roles.some(r => r.code === role);
  };

  const isSuperAdmin = () => {
    const isSuper = userRolesPermissions?.isSuper === true;
    console.log('🔐 useAuth Debug - isSuperAdmin():', isSuper);
    console.log('🔐 useAuth Debug - userRolesPermissions.isSuper:', userRolesPermissions?.isSuper);
    return isSuper;
  };

  const canManageResource = (resource) => {
    const allPermissions = getAllPermissions();
    return allPermissions.some(p =>
      p.resource === resource && p.action === 'manage'
    );
  };

  const canReadResource = (resource) => {
    const allPermissions = getAllPermissions();
    return allPermissions.some(p =>
      p.resource === resource && p.action === 'read'
    );
  };

  const getUserRoles = () => {
    return userRolesPermissions?.roles || [];
  };

  const getUserPermissions = () => {
    return getAllPermissions();
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