import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ModuleCache {
  [key: string]: {
    timestamp: number;
    data: any;
  };
}

export const useModuleNavigation = () => {
  const router = useRouter();
  const moduleCache = useRef<ModuleCache>({});
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Navegar a un módulo con cache inteligente
  const navigateToModule = useCallback((path: string, forceReload = false) => {
    // Cancelar navegación anterior si existe
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
    }

    // Si no es recarga forzada y tenemos cache válido, usar cache
    if (!forceReload && moduleCache.current[path]) {
      const cache = moduleCache.current[path];
      const now = Date.now();
      const cacheAge = now - cache.timestamp;
      
      // Cache válido por 5 minutos
      if (cacheAge < 5 * 60 * 1000) {
        console.log(`🚀 useModuleNavigation: Usando cache para ${path} (edad: ${Math.round(cacheAge / 1000)}s)`);
        router.push(path);
        return;
      }
    }

    // Navegar con delay mínimo para evitar parpadeos
    navigationTimeout.current = setTimeout(() => {
      console.log(`🚀 useModuleNavigation: Navegando a ${path}`);
      router.push(path);
    }, 50);
  }, [router]);

  // Pre-cargar módulo en background
  const preloadModule = useCallback((path: string) => {
    if (moduleCache.current[path]) return;
    
    console.log(`🔄 useModuleNavigation: Pre-cargando módulo ${path}`);
    // Aquí podrías implementar pre-carga de datos del módulo
    moduleCache.current[path] = {
      timestamp: Date.now(),
      data: null
    };
  }, []);

  // Limpiar cache de módulo
  const clearModuleCache = useCallback((path?: string) => {
    if (path) {
      delete moduleCache.current[path];
      console.log(`🧹 useModuleNavigation: Cache limpiado para ${path}`);
    } else {
      moduleCache.current = {};
      console.log(`🧹 useModuleNavigation: Cache completo limpiado`);
    }
  }, []);

  // Obtener estadísticas del cache
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const stats = {
      totalModules: Object.keys(moduleCache.current).length,
      modules: Object.entries(moduleCache.current).map(([path, cache]) => ({
        path,
        age: Math.round((now - cache.timestamp) / 1000),
        valid: (now - cache.timestamp) < 5 * 60 * 1000
      }))
    };
    
    console.log('📊 useModuleNavigation: Estadísticas del cache:', stats);
    return stats;
  }, []);

  return {
    navigateToModule,
    preloadModule,
    clearModuleCache,
    getCacheStats
  };
}; 