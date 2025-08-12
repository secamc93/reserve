'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, ApiRolesPermissionsResponse } from '@/features/users/domain/User';
import { AuthService } from '@/features/auth/application/AuthService';
import { config } from '@/shared/config/env';

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

  // Memoizar servicio para evitar recreaciones
  const authService = useMemo(() => new AuthService(config.API_BASE_URL), []);

  // Función para aplicar tema del negocio
  const applyBusinessTheme = useCallback((user: User | null) => {
    if (!user || !user.businesses || user.businesses.length === 0) return;
    
    const business = user.businesses[0];
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (business.primaryColor) {
        root.style.setProperty('--primary-color', business.primaryColor);
      }
      if (business.secondaryColor) {
        root.style.setProperty('--secondary-color', business.secondaryColor);
      }
      if (business.tertiaryColor) {
        root.style.setProperty('--tertiary-color', business.tertiaryColor);
      }
      if (business.quaternaryColor) {
        root.style.setProperty('--quaternary-color', business.quaternaryColor);
      }
      if (business.navbarImageURL) {
        root.style.setProperty('--navbar-image', `url(${business.navbarImageURL})`);
      }
    }
  }, []);

  // Asegurar que el tema quede aplicado incluso si otros efectos lo pisan
  const ensureThemeApplied = useCallback((user: User | null) => {
    if (typeof document === 'undefined') return;
    if (!user || !user.businesses || user.businesses.length === 0) return;
    const business = user.businesses[0];
    const root = document.documentElement;
    const currentPrimary = getComputedStyle(root).getPropertyValue('--primary-color').trim();
    const currentSecondary = getComputedStyle(root).getPropertyValue('--secondary-color').trim();
    const currentTertiary = getComputedStyle(root).getPropertyValue('--tertiary-color').trim();
    const currentQuaternary = getComputedStyle(root).getPropertyValue('--quaternary-color').trim();
    const currentNavbarImage = getComputedStyle(root).getPropertyValue('--navbar-image').trim();
    const targetPrimary = business.primaryColor || '';
    const targetSecondary = business.secondaryColor || '';
    const targetTertiary = business.tertiaryColor || '';
    const targetQuaternary = business.quaternaryColor || '';
    const targetNavbarImage = business.navbarImageURL ? `url(${business.navbarImageURL})` : '';
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
    if (isInitialized) {
      console.log('🔄 AppContext: Ya está inicializado, saltando...');
      return;
    }

    console.log('🚀 AppContext: Inicializando aplicación...');
    setIsLoading(true);

    try {
      // 1. Verificar autenticación
      const isAuthenticated = authService.isAuthenticated();
      if (!isAuthenticated) {
        console.log('❌ AppContext: Usuario no autenticado');
        setIsLoading(false);
        return;
      }

      // 2. Obtener información del usuario desde localStorage
      const userInfo = authService.getUserInfo();
      if (!userInfo) {
        console.log('❌ AppContext: No se pudo obtener información del usuario');
        setIsLoading(false);
        return;
      }

      setUser(userInfo);

      // 3. Aplicar tema del negocio
      applyBusinessTheme(userInfo);

      // 4. Obtener permisos del usuario (SIEMPRE cargar desde API para módulos de admin)
      let userPermissions: string[] = [];

      try {
        console.log('🔍 AppContext: Intentando cargar permisos desde API...');
        const rolesPermissions: ApiRolesPermissionsResponse | null = await authService.getUserRolesPermissions();
        console.log('🔍 AppContext: Respuesta de getUserRolesPermissions:', rolesPermissions);

        if (rolesPermissions && rolesPermissions.data) {
          // Procesar la estructura correcta del backend: resources.actions
          if (rolesPermissions.data.resources && Array.isArray(rolesPermissions.data.resources)) {
            // Extraer todos los códigos de permisos de resources.actions
            rolesPermissions.data.resources.forEach((resource: any) => {
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
          if (rolesPermissions.data.permissions && Array.isArray(rolesPermissions.data.permissions)) {
            rolesPermissions.data.permissions.forEach((permission: any) => {
              if (permission.code) {
                userPermissions.push(permission.code);
              }
            });
          }

          // Sincronizar roles en el user del contexto para uso en UI (perfil, etc.)
          if (rolesPermissions.data.roles && Array.isArray(rolesPermissions.data.roles) && rolesPermissions.data.roles.length > 0) {
            setUser(prev => {
              if (!prev) return prev;
              const mappedRoles = rolesPermissions.data.roles.map((r: any) => ({
                id: r.id,
                name: r.name,
                code: r.code,
                description: r.description || '',
                level: r.level ?? 1,
                isSystem: Boolean(r.is_system) || false,
                scopeId: r.scope_id ?? 0,
                scopeName: r.scope_name || '',
                scopeCode: r.scope_code || (r.scope || ''),
              }));
              const updatedUser = { ...prev, roles: mappedRoles } as any;
              // Reaplicar tema inmediatamente tras la actualización del usuario
              try { applyBusinessTheme(updatedUser); } catch {}
              return updatedUser;
            });
          }

          console.log('✅ AppContext: Permisos cargados desde API:', userPermissions);
        } else {
          // Fallback: usar roles del usuario como permisos básicos
          userPermissions = userInfo.roles.map((role: any) => `role:${role.code}`);
          console.log('⚠️ AppContext: Usando permisos básicos de roles:', userPermissions);
        }
      } catch (error) {
        console.warn('⚠️ AppContext: No se pudieron cargar permisos específicos, usando roles como fallback');
        console.error('🔍 AppContext: Error completo:', error);
        // Fallback: usar roles del usuario como permisos básicos
        userPermissions = userInfo.roles.map((role: any) => `role:${role.code}`);
        console.log('✅ AppContext: Permisos derivados de roles del usuario:', userPermissions);
      }

      // 5. Generar permisos adicionales basándose en roles para asegurar que se muestren todos los módulos
      let additionalPermissions: string[] = [];
      if (userInfo.roles && userInfo.roles.length > 0) {
        // Si es super admin, dar acceso a todo
        if (userInfo.roles.some((role: any) => role.scopeCode === 'platform' || role.code === 'super_admin')) {
          additionalPermissions.push(
            'users:manage', 'users:create', 'users:update', 'users:delete',
            'businesses:manage', 'tables:manage', 'rooms:manage',
            'manage_users', 'manage_businesses', 'manage_tables', 'manage_rooms'
          );
        }

        // Si tiene roles de administración, dar acceso a módulos básicos
        if (userInfo.roles.some((role: any) => role.code.includes('admin') || role.code.includes('manager'))) {
          additionalPermissions.push(
            'users:manage', 'users:create', 'users:update',
            'businesses:manage', 'tables:manage', 'rooms:manage'
          );
        }
      }

      const finalPermissions = [...new Set([...userPermissions, ...additionalPermissions])];
      setPermissions(finalPermissions);
      if (additionalPermissions.length > 0) {
        console.log('✅ AppContext: Permisos adicionales agregados:', additionalPermissions);
      }

      setIsInitialized(true);
      console.log('✅ AppContext: Aplicación inicializada exitosamente');
      console.log(`📊 AppContext: Usuario: ${userInfo.name}, Permisos: ${finalPermissions.length}`);

    } catch (error) {
      console.error('❌ AppContext: Error inicializando aplicación:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authService, applyBusinessTheme, isInitialized]);

  // Función para actualizar datos del usuario
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...userData };
      
      // Aplicar tema si cambió el negocio
      if (userData.businesses) {
        applyBusinessTheme(updatedUser);
      }
      
      return updatedUser;
    });
  }, [applyBusinessTheme]);

  // Función para limpiar el contexto
  const clearApp = useCallback(() => {
    setUser(null);
    setPermissions([]);
    setIsInitialized(false);
    setIsLoading(false);
    
    // Limpiar tema
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--secondary-color');
    }
  }, []);

  // Función para verificar permisos
  const hasPermission = useCallback((permission: string) => {
    if (!user || !permissions.length) return false;
    
    // Super admin tiene todos los permisos
    if (isSuperAdmin()) return true;
    
    // Verificar permiso específico
    return permissions.includes(permission);
  }, [user, permissions]);

  // Función para verificar si es super admin
  const isSuperAdmin = useCallback(() => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.scopeCode === 'platform');
  }, [user]);

  // Inicializar aplicación al montar el componente
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Aplicar tema cada vez que cambia el usuario
  useEffect(() => {
    applyBusinessTheme(user);
    // Reasegurar colores en el siguiente frame
    const id = requestAnimationFrame(() => ensureThemeApplied(user));
    return () => cancelAnimationFrame(id);
  }, [user, applyBusinessTheme, ensureThemeApplied]);

  // Memoizar el valor del contexto para evitar re-renderizados
  const contextValue = useMemo(() => ({
    user,
    permissions,
    isLoading,
    isInitialized,
    initializeApp,
    updateUser,
    clearApp,
    hasPermission,
    isSuperAdmin,
  }), [
    user,
    permissions,
    isLoading,
    isInitialized,
    initializeApp,
    updateUser,
    clearApp,
    hasPermission,
    isSuperAdmin,
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