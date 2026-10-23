/**
 * Super admin: administradores de la propiedad y su exención (cubre todos sus conjuntos).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { listPropertyAdminsAction, setAdminExemptionAction } from '../../infrastructure/actions';
import type { PropertyAdmin } from '../../domain/entities';
import { VtDialog, VtNotice, VtSwitch } from '../design';

export function PropertyAdminsDialog({ open, businessId, onClose, onChanged }: { open: boolean; businessId: number; onClose: () => void; onChanged: () => void }) {
  const [admins, setAdmins] = useState<PropertyAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    const r = await listPropertyAdminsAction({ token, businessId });
    if (r.success && r.data) setAdmins(r.data);
    else setError(r.error ?? 'No se pudieron cargar los administradores');
  }, [businessId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const toggle = async (a: PropertyAdmin) => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setBusyId(a.userId);
    const r = await setAdminExemptionAction({ token, userId: a.userId, exempt: !a.exempt });
    setBusyId(null);
    if (!r.success) return setError(r.error ?? 'No se pudo cambiar la exención');
    await load();
    onChanged();
  };

  return (
    <VtDialog open={open} onClose={onClose} eyebrow="Super admin" title="Administradores de la propiedad"
      subtitle="Exentar a un administrador libera el cobro en todos los conjuntos que administra, también los que agregue después.">
      <div className="flex flex-col gap-2">
        {error && <VtNotice>{error}</VtNotice>}
        {admins === null && !error && <div className="text-[13px]">Cargando…</div>}
        {admins?.length === 0 && <div className="text-[13px]">Esta propiedad no tiene administradores vinculados.</div>}
        {admins?.map((a) => (
          <div key={a.userId} className="flex items-center justify-between gap-3 border-b py-2" style={{ borderColor: '#e4e2dd' }}>
            <div className="min-w-0">
              <div className="text-[14px] font-medium truncate">{a.name}</div>
              <div className="text-[12px] truncate" style={{ color: '#8a8580' }}>{a.email}</div>
            </div>
            <VtSwitch checked={a.exempt} onChange={() => toggle(a)} label={`Exento: ${a.name}`} busy={busyId === a.userId} />
          </div>
        ))}
      </div>
    </VtDialog>
  );
}
