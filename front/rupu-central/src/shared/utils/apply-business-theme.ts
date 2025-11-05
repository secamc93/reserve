/**
 * Utilidad para aplicar el tema del negocio
 * Extrae los colores del business y los aplica al tema
 */

import { TokenStorage, BusinessColors } from '@shared/config';

interface Business {
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  quaternary_color: string;
  name: string;
}

/**
 * Aplica los colores de un negocio al tema global
 */
export function applyBusinessTheme(business: Business): void {
  const colors: BusinessColors = {
    primary: business.primary_color,
    secondary: business.secondary_color,
    tertiary: business.tertiary_color,
    quaternary: business.quaternary_color,
  };

  // Guardar en localStorage
  TokenStorage.setBusinessColors(colors);

  // Aplicar a las CSS variables
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    document.documentElement.style.setProperty('--color-tertiary', colors.tertiary);
    document.documentElement.style.setProperty('--color-quaternary', colors.quaternary);

    // Disparar evento para que otros componentes se enteren
    window.dispatchEvent(new Event('businessChanged'));

    console.log(`✅ Tema aplicado para: ${business.name}`, colors);
  }
}

/**
 * Restaura los colores por defecto
 */
export function resetTheme(): void {
  const defaultColors: BusinessColors = {
    primary: '#0f172a',
    secondary: '#be185d',
    tertiary: '#06b6d4',
    quaternary: '#f59e0b',
  };

  TokenStorage.setBusinessColors(defaultColors);

  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--color-primary', defaultColors.primary);
    document.documentElement.style.setProperty('--color-secondary', defaultColors.secondary);
    document.documentElement.style.setProperty('--color-tertiary', defaultColors.tertiary);
    document.documentElement.style.setProperty('--color-quaternary', defaultColors.quaternary);
  }
}

