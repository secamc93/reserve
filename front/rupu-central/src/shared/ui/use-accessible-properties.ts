/**
 * Hook: propiedades horizontales a las que accede el usuario (super admin: todas, desde la API;
 * demás usuarios: las de su login). La consulta del super admin se hace una sola vez por sesión
 * de página (caché de módulo) y la comparten la barra lateral y el selector.
 */

'use client';

import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { toPropertyOptions, type PropertyOption } from '../utils/properties';

let superAdminCache: Promise<PropertyOption[]> | null = null;

async function fetchAllProperties(): Promise<PropertyOption[]> {
  const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
  if (!token) return [];
  const { getBusinessesAction } = await import('@/services/auth/businesses/infrastructure/actions/get-businesses.action');
  const result = await getBusinessesAction({ token, page: 1, per_page: 100 });
  if (!result.success || !result.data) throw new Error(result.error || 'No se pudieron cargar las propiedades');
  // La API no trae el código del tipo; el producto es solo de propiedad horizontal.
  return toPropertyOptions(result.data.businesses);
}

export function loadAccessibleProperties(): Promise<PropertyOption[]> {
  const user = TokenStorage.getUser();
  if (!user?.is_super_admin) return Promise.resolve(toPropertyOptions(TokenStorage.getBusinessesData()));
  if (!superAdminCache) {
    superAdminCache = fetchAllProperties();
    superAdminCache.catch(() => { superAdminCache = null; });
  }
  return superAdminCache;
}

export function useAccessibleProperties(): { properties: PropertyOption[]; loading: boolean; error: string | null } {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadAccessibleProperties()
      .then((list) => { if (alive) setProperties(list); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'No se pudieron cargar las propiedades'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { properties, loading, error };
}
