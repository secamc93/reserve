/**
 * Hook: genera el enlace público del grupo y su imagen QR (A5 y QR plegable de A6).
 * Usa la Server Action existente `generateGroupPublicUrlAction` y la librería `qrcode`.
 */

'use client';

import { useCallback, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { generateGroupPublicUrlAction } from '../../infrastructure/actions/public-voting';
import type { GroupQRData } from '../components/group-qr-modal';

/** Horas de validez del enlace público del grupo. */
export const GROUP_QR_VALID_HOURS = 24;

export function useGroupQr(businessId: number, groupId: number) {
  const [data, setData] = useState<GroupQRData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (): Promise<GroupQRData | null> => {
    const token = TokenStorage.getBusinessToken();
    if (!token) {
      setError('No hay token de autenticación');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateGroupPublicUrlAction({ token, businessId, groupId, durationHours: GROUP_QR_VALID_HOURS });
      if (!result.success || !result.data) throw new Error(result.error || 'No se pudo generar el enlace público');
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.default.toDataURL(result.data.public_url, {
        width: 400,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#FFFFFF' },
      });
      const hours = result.data.expires_in_hours || GROUP_QR_VALID_HOURS;
      const next: GroupQRData = {
        qrDataUrl,
        publicUrl: result.data.public_url,
        groupName: result.data.group_name,
        votingsCount: result.data.votings_count,
        expiresAt: new Date(Date.now() + hours * 3600_000).toISOString(),
      };
      setData(next);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el código QR');
      return null;
    } finally {
      setLoading(false);
    }
  }, [businessId, groupId]);

  return { data, loading, error, generate };
}
