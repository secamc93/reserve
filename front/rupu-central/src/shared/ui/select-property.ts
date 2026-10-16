/**
 * Activa una propiedad: genera el token del negocio, guarda la propiedad activa y sus colores, y
 * navega a su resumen (recarga completa para que el shell tome los colores y permisos nuevos).
 */

'use client';

import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { HORIZONTAL_PROPERTY_TYPE, type PropertyOption } from '../utils/properties';

export async function selectProperty(property: PropertyOption): Promise<{ success: boolean; error?: string }> {
  const sessionToken = TokenStorage.getSessionToken();
  if (!sessionToken) return { success: false, error: 'La sesión expiró. Inicia sesión de nuevo.' };

  const result = await generateBusinessTokenAction({ business_id: property.id, session_token: sessionToken });
  if (!result.success || !result.data) return { success: false, error: result.error || 'No se pudo abrir la propiedad' };

  TokenStorage.setBusinessToken(result.data.token);
  TokenStorage.setActiveBusiness(property.id);
  TokenStorage.setActiveBusinessType(HORIZONTAL_PROPERTY_TYPE);
  TokenStorage.removeUserPermissions();
  TokenStorage.setBusinessColors({
    primary: property.primaryColor || '#0f172a',
    secondary: property.secondaryColor || '#be185d',
    tertiary: property.tertiaryColor || '#06b6d4',
    quaternary: property.quaternaryColor || '#f59e0b',
  });
  window.location.href = `/properties/${property.id}`;
  return { success: true };
}
