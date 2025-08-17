'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User } from '@/services/users/domain/entities/User';
import { useServerAuth } from '@/shared/hooks/useServerAuth';

interface AppContextType {
  // Estado global esencial
  user: User | null;
  permissions: string[];
  
  // Estado de carga
  isLoading: boolean;
  isInitialized: boolean;
  
  // Funciones
  initializeApp: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearApp: () => void;
  
  // Utilidades
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Flag para evitar múltiples inicializaciones
  const initializationRef = useRef(false);

  // Usar el nuevo hook de Server Actions
  const {
    isAuthenticated,
    user: authUser,
    permissions: authPermissions,
    loading: authLoading,
    error: authError,
    initializeAuth,
    hasPermission: serverHasPermission,
    isSuperAdmin: serverIsSuperAdmin
  } = useServerAuth();

  // Función para aplicar tema del negocio
  const applyBusinessTheme = useCallback((user: User | null) => {
    if (!user || !user.businesses || user.businesses.length === 0) return;
    
    const business = user.businesses[0] as any; // Usar any temporalmente para evitar errores de tipo
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (business.primary_color) {
        root.style.setProperty('--primary-color', business.primary_color);
      }
      if (business.secondary_color) {
        root.style.setProperty('--secondary-color', business.secondary_color);
      }
      if (business.tertiary_color) {
        root.style.setProperty('--tertiary-color', business.tertiary_color);
      }
      if (business.quaternary_color) {
        root.style.setProperty('--quaternary-color', business.quaternary_color);
      }
      if (business.navbar_image_url) {
        root.style.setProperty('--navbar-image', `url(${business.navbar_image_url})`);
      }
    }
  }, []);

  // Asegurar que el tema quede aplicado incluso si otros efectos lo pisan
  const ensureThemeApplied = useCallback((user: User | null) => {
    if (typeof document === 'undefined') return;
    if (!user || !user.businesses || user.businesses.length === 0) return;
    const business = user.businesses[0] as any; // Usar any temporalmente para evitar errores de tipo
    const root = document.documentElement;
    const currentPrimary = getComputedStyle(root).getPropertyValue('--primary-color').trim();
    const currentSecondary = getComputedStyle(root).getPropertyValue('--secondary-color').trim();
    const currentTertiary = getComputedStyle(root).getPropertyValue('--tertiary-color').trim();
    const currentQuaternary = getComputedStyle(root).getPropertyValue('--quaternary-color').trim();
    const currentNavbarImage = getComputedStyle(root).getPropertyValue('--navbar-image').trim();
    const targetPrimary = business.primary_color || '';
    const targetSecondary = business.secondary_color || '';
    const targetTertiary = business.tertiary_color || '';
    const targetQuaternary = business.quaternary_color || '';
    const targetNavbarImage = business.navbar_image_url ? `url(${business.navbar_image_url})` : '';
    // Si no coincide con el negocio, reestablecer
    if (targetPrimary && currentPrimary !== targetPrimary) {
      root.style.setProperty('--primary-color', targetPrimary);
    }
    if (targetSecondary && currentSecondary !== targetSecondary) {
      root.style.setProperty('--secondary-color', targetSecondary);
    }
    if (targetTertiary && currentTertiary !== targetTertiary) {
      root.style.setProperty('--tertiary-color', targetTertiary);
    }
    if (targetQuaternary && currentQuaternary !== targetQuaternary) {
      root.style.setProperty('--quaternary-color', targetQuaternary);
    }
    if (targetNavbarImage && currentNavbarImage !== targetNavbarImage) {
      root.style.setProperty('--navbar-image', targetNavbarImage);
    }
  }, []);

  // Función para inicializar la aplicación (se ejecuta UNA SOLA VEZ)
  const initializeApp = useCallback(async () => {
    if (initializationRef.current) {
      console.log('🔄 AppContext: Ya está inicializado, saltando...');
      return;
    }

    // Protección adicional contra re-inicialización
    if (isLoading) {
      console.log('🔄 AppContext: Ya está cargando, saltando...');
      return;
    }

    console.log('🚀 AppContext: Inicializando aplicación...');
    console.log('🔍 AppContext: Estado actual:', {
      isAuthenticated,
      authUser: !!authUser,
      authPermissions: !!authPermissions,
      authLoading,
      authError
    });
    
    setIsLoading(true);

    try {
      // 1. Inicializar autenticación usando Server Actions
      console.log('🔍 AppContext: Llamando a initializeAuth...');
      await initializeAuth();
      console.log('✅ AppContext: initializeAuth completado');
      
      // 2. Usar información del usuario del hook de autenticación
      if (authUser) {
        console.log('✅ AppContext: Usuario autenticado encontrado');
        setUser(authUser);
        applyBusinessTheme(authUser);
      }

      // 3. Procesar permisos del hook de autenticación
      if (authPermissions) {
        console.log('🔍 AppContext: Procesando permisos...');
        let userPermissions: string[] = [];

        // Procesar la estructura correcta del backend: resources.actions
        if (authPermissions.resources && Array.isArray(authPermissions.resources)) {
          authPermissions.resources.forEach((resource: any) => {
            if (resource.actions && Array.isArray(resource.actions)) {
              resource.actions.forEach((action: any) => {
                if (action.code) {
                  userPermissions.push(action.code);
                }
              });
            }
          });
        }

        // También agregar permisos directos si existen
        if (authPermissions.permissions && Array.isArray(authPermissions.permissions)) {
          authPermissions.permissions.forEach((permission: any) => {
            if (permission.code) {
              userPermissions.push(permission.code);
            }
          });
        }

        setPermissions(userPermissions);
        console.log('✅ AppContext: Permisos cargados desde Server Actions:', userPermissions);
      }

      setIsInitialized(true);
      initializationRef.current = true; // Marcar como inicializado
      console.log('✅ AppContext: Aplicación inicializada correctamente');

    } catch (error) {
      console.error('❌ AppContext: Error durante la inicialización:', error);
      if (authError) {
        console.error('❌ AppContext: Error de autenticación:', authError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, initializeAuth, applyBusinessTheme, isAuthenticated, authUser, authPermissions, authLoading, authError]);

  // Inicializar aplicación cuando el hook de autenticación esté listo
  useEffect(() => {
    // Solo inicializar UNA SOLA VEZ cuando no esté inicializado
    if (!initializationRef.current && !authLoading && !authError) {
      console.log('🔍 AppContext: Condiciones cumplidas, iniciando...');
      initializeApp();
    } else {
      console.log('🔍 AppContext: Saltando inicialización:', {
        isInitialized: initializationRef.current,
        authLoading,
        authError: !!authError
      });
    }
  }, [initializationRef.current, authLoading, authError, initializeApp]);

  // Sincronizar loading del hook de autenticación (SIMPLIFICADO)
  useEffect(() => {
    if (authLoading && !isLoading) {
      setIsLoading(true);
    } else if (!authLoading && isLoading && !initializationRef.current) {
      setIsLoading(false);
    }
  }, [authLoading, isLoading, initializationRef.current]);

  // Sincronizar estado del hook de autenticación (UNA SOLA VEZ)
  useEffect(() => {
    console.log('🔄 [AppContext] useEffect - Sincronizando usuario:', {
      authUser: !!authUser,
      user: !!user,
      shouldUpdate: authUser && !user
    });
    
    if (authUser && !user) {
      console.log('✅ [AppContext] Actualizando usuario del contexto');
      setUser(authUser);
      applyBusinessTheme(authUser);
    }
  }, [authUser, user, applyBusinessTheme]);

  // Sincronizar permisos del hook de autenticación (UNA SOLA VEZ)
  useEffect(() => {
    console.log('🔄 [AppContext] useEffect - Sincronizando permisos:', {
      authPermissions: !!authPermissions,
      permissions: permissions.length,
      shouldUpdate: authPermissions && permissions.length === 0
    });
    
    if (authPermissions) {
      console.log('✅ [AppContext] Actualizando permisos del contexto');
      console.log('📊 [AppContext] Estructura de authPermissions:', {
        hasResources: !!(authPermissions.resources && authPermissions.resources.length > 0),
        hasPermissions: !!(authPermissions.permissions && authPermissions.permissions.length > 0),
        hasRoles: !!(authPermissions.roles && authPermissions.roles.length > 0),
        resourcesCount: authPermissions.resources?.length || 0,
        permissionsCount: authPermissions.permissions?.length || 0,
        rolesCount: authPermissions.roles?.length || 0
      });
      
      // Agregar logging detallado de authPermissions
      console.log('🔍 [AppContext] authPermissions completo:', JSON.stringify(authPermissions, null, 2));
      
      let userPermissions: string[] = [];

      // Procesar la estructura correcta del backend: resources.actions
      if (authPermissions.resources && Array.isArray(authPermissions.resources)) {
        console.log('🔍 [AppContext] Procesando resources.actions...');
        authPermissions.resources.forEach((resource: any) => {
          if (resource.actions && Array.isArray(resource.actions)) {
            resource.actions.forEach((action: any) => {
              if (action.code) {
                userPermissions.push(action.code);
                console.log('✅ [AppContext] Permiso agregado:', action.code);
              }
            });
          }
        });
      }

      // También agregar permisos directos si existen
      if (authPermissions.permissions && Array.isArray(authPermissions.permissions)) {
        console.log('🔍 [AppContext] Procesando permissions directos...');
        authPermissions.permissions.forEach((permission: any) => {
          if (permission.code) {
            userPermissions.push(permission.code);
            console.log('✅ [AppContext] Permiso directo agregado:', permission.code);
          }
        });
      }

      setPermissions(userPermissions);
      console.log('✅ [AppContext] Permisos sincronizados desde Server Actions:', userPermissions);
    } else {
      console.log('❌ [AppContext] No hay authPermissions disponibles');
    }
  }, [authPermissions]);

  // Función para actualizar usuario
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...userData };
      applyBusinessTheme(updatedUser);
      return updatedUser;
    });
  }, [applyBusinessTheme]);

  // Función para limpiar aplicación
  const clearApp = useCallback(() => {
    setUser(null);
    setPermissions([]);
    setIsInitialized(false);
    setIsLoading(false);
    initializationRef.current = false; // Resetear el flag
  }, []);

  // Función para verificar permisos (usar Server Actions)
  const hasPermission = useCallback((permission: string): boolean => {
    return serverHasPermission(permission);
  }, [serverHasPermission]);

  // Función para verificar si es super admin (usar Server Actions)
  const isSuperAdmin = useCallback((): boolean => {
    return serverIsSuperAdmin();
  }, [serverIsSuperAdmin]);

  // Memoizar contexto para evitar re-renderizados innecesarios
  const contextValue = useMemo(() => ({
    user,
    permissions,
    isLoading,
    isInitialized,
    initializeApp,
    updateUser,
    clearApp,
    hasPermission,
    isSuperAdmin
  }), [
    user,
    permissions,
    isLoading,
    isInitialized,
    initializeApp,
    updateUser,
    clearApp,
    hasPermission,
    isSuperAdmin
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider');
  }
  return context;
};

export default AppContext; 