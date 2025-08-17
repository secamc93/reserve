// Utilidades generales compartidas

/**
 * Formatea una fecha a formato legible
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea un precio a formato de moneda
 */
export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(price);
};

/**
 * Capitaliza la primera letra de una cadena
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Genera un ID único simple
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
}; 