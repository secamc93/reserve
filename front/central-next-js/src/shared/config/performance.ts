// Configuración de optimizaciones de rendimiento
export const PERFORMANCE_CONFIG = {
  // Cache de módulos
  MODULE_CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutos
    MAX_MODULES: 10,
    PRELOAD_DELAY: 1000, // 1 segundo
  },

  // Debounce para filtros
  DEBOUNCE: {
    FILTERS: 300, // 300ms
    SEARCH: 500,  // 500ms
    NAVIGATION: 50, // 50ms
  },

  // Lazy loading
  LAZY_LOADING: {
    THRESHOLD: 0.1, // 10% del viewport
    ROOT_MARGIN: '50px',
  },

  // Memoización
  MEMOIZATION: {
    ENABLED: true,
    MAX_DEPENDENCIES: 5,
  },

  // Logging de rendimiento
  PERFORMANCE_LOGGING: {
    ENABLED: process.env.NODE_ENV === 'development',
    THRESHOLD: 100, // ms
  },

  // Optimizaciones de imágenes
  IMAGE_OPTIMIZATION: {
    LAZY_LOADING: true,
    PLACEHOLDER_BLUR: true,
    WEBP_SUPPORT: true,
  },

  // Bundle splitting
  BUNDLE_SPLITTING: {
    ENABLED: true,
    CHUNK_SIZE: 244 * 1024, // 244KB
  },
};

// Función para medir rendimiento
export const measurePerformance = (name: string, fn: () => void) => {
  if (!PERFORMANCE_CONFIG.PERFORMANCE_LOGGING.ENABLED) {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > PERFORMANCE_CONFIG.PERFORMANCE_LOGGING.THRESHOLD) {
    console.warn(`⚠️ Performance: ${name} tomó ${duration.toFixed(2)}ms`);
  } else {
    console.log(`✅ Performance: ${name} tomó ${duration.toFixed(2)}ms`);
  }
};

// Función para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Función para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Función para memoización con TTL
export const memoizeWithTTL = <T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = PERFORMANCE_CONFIG.MODULE_CACHE.TTL
) => {
  const cache = new Map<string, { value: any; timestamp: number }>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  }) as T;
};

export default PERFORMANCE_CONFIG; 