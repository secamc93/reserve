'use client';

import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

/**
 * Token de negocio para las acciones del módulo: el guardado, o uno nuevo a partir de la
 * sesión (el super admin pide business_id = 0 y envía el business_id en cada petición).
 */
export async function getUnitsBusinessToken(businessId: number): Promise<string> {
  const stored = TokenStorage.getBusinessToken();
  if (stored) return stored;

  const sessionToken = TokenStorage.getSessionToken();
  if (!sessionToken) throw new Error('No hay sesión activa');

  const isSuperAdmin = TokenStorage.getUser()?.is_super_admin;
  const business_id = isSuperAdmin ? 0 : businessId;
  const result = await generateBusinessTokenAction({ business_id, session_token: sessionToken });
  if (!result.success || !result.data) throw new Error(result.error || 'No se pudo generar el token de negocio');

  TokenStorage.setBusinessToken(result.data.token);
  TokenStorage.setActiveBusiness(business_id);
  return result.data.token;
}
