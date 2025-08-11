'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthService } from '@/features/auth/application/AuthService';
import { config } from '@/shared/config/env';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoizar instancia del servicio para evitar recreaciones
  const authService = useMemo(() => new AuthService(config.API_BASE_URL), []);

  // Verificar estado de autenticación
  const checkAuthStatus = useCallback(() => {
    try {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [authService]);

  // Función de login simplificada
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.login({ email, password });

      if (result.success) {
        if (result.requirePasswordChange) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('userInfo', JSON.stringify(result.data.user));
          }
          window.location.href = '/change-password';
          return { success: true, requirePasswordChange: true };
        }

        // Login exitoso - el contexto global se encargará de cargar el resto de la información
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  // Función de logout simplificada
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userRolesPermissions');
    }
    
    // Limpiar tema
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--secondary-color');
    }
  }, [authService]);

  // Verificar estado de autenticación al montar el hook
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus
  };
}; 