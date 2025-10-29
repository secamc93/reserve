/**
 * Hook personalizado para manejar autenticación
 * Centraliza la lógica de login, logout y manejo de token
 */

'use client';

import { useState, useCallback } from 'react';
import { TokenStorage } from '../../infrastructure/storage';
import { applyBusinessTheme } from '@shared/utils';

interface LoginData {
  email: string;
  password: string;
}

interface BusinessData {
  id: number;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
}

interface LoginResult {
  success: boolean;
  data?: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    token: string;
    businesses: BusinessData[];
  };
  error?: string;
}

interface UseAuthReturn {
  login: (data: LoginData) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export function useAuth(
  loginAction: (data: LoginData) => Promise<LoginResult>
): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    TokenStorage.hasSessionToken()
  );
  const [user, setUser] = useState(() => 
    TokenStorage.getUser()
  );

  const login = useCallback(
    async (data: LoginData): Promise<LoginResult> => {
      try {
        const result = await loginAction(data);

        if (result.success && result.data) {
          // Guardar session token en localStorage
          TokenStorage.setSessionToken(result.data.token);
          
          // Guardar datos del usuario en localStorage
          const userData = {
            userId: result.data.userId,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role,
            avatarUrl: result.data.avatarUrl,
          };
          TokenStorage.setUser(userData);

          // Guardar IDs y datos básicos de los negocios en localStorage
          const businesses = result.data.businesses || [];
          const businessIds = businesses.map(b => b.id);
          TokenStorage.setBusinessIds(businessIds);
          TokenStorage.setBusinessesData(businesses);

          // Establecer el primer business activo como sesión activa
          const firstActiveBusiness = businesses.find(b => b.is_active);
          if (firstActiveBusiness) {
            TokenStorage.setActiveBusiness(firstActiveBusiness.id);
            console.log('Negocio activo (ID):', firstActiveBusiness.id);

            // Aplicar colores del negocio si están disponibles
            if (
              firstActiveBusiness.primary_color &&
              firstActiveBusiness.secondary_color &&
              firstActiveBusiness.tertiary_color &&
              firstActiveBusiness.quaternary_color
            ) {
              applyBusinessTheme(firstActiveBusiness as unknown as { name: string; primary_color: string; secondary_color: string; tertiary_color: string; quaternary_color: string });
            }
          }

          // Actualizar estado local
          setIsAuthenticated(true);
          setUser(userData);
        }

        return result;
      } catch (error) {
        console.error('Error en login:', error);
        return {
          success: false,
          error: 'Error inesperado al iniciar sesión',
        };
      }
    },
    [loginAction]
  );

  const logout = useCallback(() => {
    // Limpiar localStorage
    TokenStorage.clearSession();
    
    // Actualizar estado local
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    login,
    logout,
    isAuthenticated,
    user,
  };
}

