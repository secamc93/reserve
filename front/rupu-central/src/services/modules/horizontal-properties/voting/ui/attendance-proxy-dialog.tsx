/**
 * Apoderado de una unidad en la lista de asistencia: nombre y documento de quien asiste por
 * ella. Al guardarlo la unidad queda presente como apoderado; "Quitar apoderado" la deja sin
 * asistencia. El apoderado vale solo para esta lista.
 */

'use client';

import { useEffect, useId, useState } from 'react';
import { assignRecordProxyAction, removeRecordProxyAction, type RecordProxyData } from '../../attendance/infrastructure/actions';
import { VtDialog, VtNotice, vtBtn, vtInput, vtLabel } from '@shared/ui/ds';
import type { AttendanceRow } from './design';

export function AttendanceProxyDialog({
  row,
  token,
  onClose,
  onSaved,
}: {
  row: AttendanceRow | null;
  token: string | null;
  onClose: () => void;
  onSaved: (row: AttendanceRow, result: RecordProxyData) => void;
}) {
  const nameId = useId();
  const dniId = useId();
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(row?.proxyName ?? '');
    setDni('');
    setError(null);
  }, [row]);

  if (!row) return null;

  const run = async (remove: boolean) => {
    if (!token || row.recordId == null) return;
    if (!remove && !name.trim()) {
      setError('Escribe el nombre del apoderado.');
      return;
    }
    setBusy(true);
    setError(null);
    const res = remove
      ? await removeRecordProxyAction({ token, recordId: row.recordId })
      : await assignRecordProxyAction({ token, recordId: row.recordId, proxyName: name, proxyDni: dni });
    setBusy(false);
    if (!res.success || !res.data) {
      setError(res.error || 'No se pudo guardar el apoderado');
      return;
    }
    onSaved(row, res.data);
  };

  return (
    <VtDialog
      open
      onClose={onClose}
      busy={busy}
      layer="over"
      eyebrow={`Unidad ${row.unitNumber}`}
      title={row.proxyName ? 'Editar apoderado' : 'Agregar apoderado'}
      subtitle={row.residentName ? `Propietario: ${row.residentName}` : undefined}
      width={460}
      footer={
        <>
          {row.proxyName && (
            <button type="button" className={`${vtBtn.secondary} mr-auto text-[#b4432b]`} onClick={() => run(true)} disabled={busy}>
              Quitar apoderado
            </button>
          )}
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={busy}>Cancelar</button>
          <button type="button" className={vtBtn.primary} onClick={() => run(false)} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          run(false);
        }}
      >
        {error && <VtNotice>{error}</VtNotice>}
        <div>
          <label htmlFor={nameId} className={vtLabel}>Nombre del apoderado</label>
          <input id={nameId} className={vtInput} value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={120} />
        </div>
        <div>
          <label htmlFor={dniId} className={vtLabel}>Documento (opcional)</label>
          <input id={dniId} className={vtInput} value={dni} onChange={(e) => setDni(e.target.value)} maxLength={30} />
        </div>
        <p className="m-0 text-xs text-[#8a8580]">Al guardar, la unidad queda presente como apoderado en esta asamblea.</p>
      </form>
    </VtDialog>
  );
}
