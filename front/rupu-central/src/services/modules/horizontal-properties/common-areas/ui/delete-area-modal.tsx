'use client';

import { useState } from 'react';
import { VtDialog, VtNotice, vtBtn } from '@/shared/ui/ds';
import { deleteCommonAreaAction } from '../infrastructure/actions';

export interface DeleteAreaModalProps {
  businessId: number;
  area: { id: number; name: string } | null;
  getToken: () => Promise<string>;
  onClose: () => void;
  onDeleted: (message: string) => void;
}

/** Confirmación para eliminar una zona común. */
export function DeleteAreaModal({ businessId, area, getToken, onClose, onDeleted }: DeleteAreaModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!area) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await deleteCommonAreaAction({ token, businessId, id: area.id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onDeleted(`Zona "${area.name}" eliminada`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la zona');
    } finally {
      setBusy(false);
    }
  };

  return (
    <VtDialog
      open={area !== null}
      onClose={() => {
        setError(null);
        onClose();
      }}
      busy={busy}
      eyebrow="Zonas comunes"
      title="Eliminar zona"
      subtitle={area?.name}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={`${vtBtn.primary} !bg-[#c8382d] hover:!bg-[#a52c23]`} onClick={confirm} disabled={busy}>
            {busy ? 'Eliminando…' : 'Eliminar'}
          </button>
        </>
      }
    >
      {error && <VtNotice>{error}</VtNotice>}
      <p className="m-0 text-sm text-[#4b4a46]">
        La zona deja de aparecer y no recibe nuevas reservas. Si solo quieres pausarla, desactívala en su lugar.
      </p>
    </VtDialog>
  );
}
