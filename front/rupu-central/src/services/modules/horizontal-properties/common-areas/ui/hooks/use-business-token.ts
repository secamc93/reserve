'use client';

import { useCallback } from 'react';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';

/**
 * Devuelve una función que entrega el business token (lo genera si falta). El super admin
 * recibe un token con business_id = 0 y cada petición envía ?business_id=<propiedad>.
 */
export function useBusinessToken(businessId: number) {
  return useCallback(async (): Promise<string> => {
    const cached = TokenStorage.getBusinessToken();
    if (cached) return cached;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');

    const user = TokenStorage.getUser();
    const tokenBusinessId = user?.is_super_admin ? 0 : businessId;
    const result = await generateBusinessTokenAction({ business_id: tokenBusinessId, session_token: sessionToken });
    if (!result.success || !result.data) throw new Error(result.error || 'No se pudo abrir la propiedad');

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(tokenBusinessId);
    return result.data.token;
  }, [businessId]);
}
