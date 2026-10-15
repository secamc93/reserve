/**
 * Hook: propiedad activa (nombre, logo y color primario) para el shell.
 *
 * Primero busca en `businesses_data` del login. El super admin no trae ahí todas las
 * propiedades: en ese caso la pide una sola vez a la API (lista de negocios) y la deja en
 * caché de módulo, compartida por la barra superior y la barra inferior.
 */

'use client';

import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { resolveActiveProperty, type ActiveProperty } from '../utils/navigation';

const cache = new Map<number, Promise<ActiveProperty | null>>();

async function fetchProperty(id: number): Promise<ActiveProperty | null> {
  const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
  if (!token) return null;
  const { getBusinessesAction } = await import('@/services/auth/businesses/infrastructure/actions/get-businesses.action');
  const result = await getBusinessesAction({ token, page: 1, per_page: 100 });
  return resolveActiveProperty(result.success ? result.data?.businesses : null, id);
}

function loadProperty(id: number): Promise<ActiveProperty | null> {
  let pending = cache.get(id);
  if (!pending) {
    pending = fetchProperty(id).catch(() => null);
    cache.set(id, pending);
    // Si falla, no dejarlo en caché para reintentar en el próximo montaje.
    pending.then((p) => { if (!p) cache.delete(id); });
  }
  return pending;
}

/** @param enabled si es false no lee ni consulta nada (devuelve null). */
export function useActiveProperty(enabled = true): ActiveProperty | null {
  const [property, setProperty] = useState<ActiveProperty | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const refresh = () => {
      const id = TokenStorage.getActiveBusiness();
      const local = resolveActiveProperty(TokenStorage.getBusinessesData(), id);
      if (local || !id) {
        setProperty(local);
        return;
      }
      loadProperty(id).then((p) => { if (alive) setProperty(p); });
    };
    refresh();
    window.addEventListener('businessChanged', refresh);
    return () => {
      alive = false;
      window.removeEventListener('businessChanged', refresh);
    };
  }, [enabled]);

  return property;
}
