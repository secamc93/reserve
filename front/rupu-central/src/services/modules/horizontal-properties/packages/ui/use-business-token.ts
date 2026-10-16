'use client';

import { useCallback } from 'react';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

/**
 * Token de negocio para las server actions del módulo (lo guarda TokenStorage). El super admin
 * pide el token con business_id 0 y cada consulta lleva el business_id de la propiedad.
 */
export function useBusinessToken(businessId: number): () => Promise<string> {
  return useCallback(async (): Promise<string> => {
    const cached = TokenStorage.getBusinessToken();
    if (cached) return cached;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No hay sesión activa');

    const user = TokenStorage.getUser();
    const business_id = user?.is_super_admin ? 0 : businessId;
    const result = await generateBusinessTokenAction({ business_id, session_token: sessionToken });
    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar el token de negocio');
    }
    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(business_id);
    return result.data.token;
  }, [businessId]);
}
