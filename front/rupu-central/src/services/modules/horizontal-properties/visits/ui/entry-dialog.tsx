'use client';

/**
 * V4 · Registrar entrada (hoja inferior en teléfono, modal en escritorio): visitante,
 * documento · tipo · hora programada, la unidad con quién autorizó, la puerta (se guarda en
 * entry_gate) y "Confirmar entrada · HH:MM".
 */

import { useEffect, useState } from 'react';
import { VtDialog, VtNotice, vtBtn, dsMono } from '@/shared/ui/ds';
import { registerEntryAction } from '../infrastructure/actions';
import type { VisitListDTO } from '../domain';
import { useBusinessToken } from './use-business-token';
import { formatClock, formatDoc, formatWallTime, unitLabel } from './visit-state';

export const ENTRY_GATES = ['Principal', 'Vehicular', 'Peatonal 2'] as const;

/** Hora actual "HH:MM" que se refresca cada 20 s mientras el diálogo está abierto. */
export function useClock(active: boolean): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(t);
  }, [active]);
  return formatClock(now.toISOString());
}

export function EntryDialog({
  businessId,
  row,
  onClose,
  onDone,
}: {
  businessId: number;
  row: VisitListDTO | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const getToken = useBusinessToken(businessId);
  const open = !!row;
  const clock = useClock(open);
  const [gate, setGate] = useState<string>('Principal');
  const [docChecked, setDocChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!row) return;
    setGate(row.visitorVehiclePlate ? 'Vehicular' : 'Principal');
    setDocChecked(false);
    setError(null);
  }, [row]);

  if (!row) return null;

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      await registerEntryAction({ businessId, visitId: row.id, data: { gate, method: 'manual' }, token });
      onDone(`Entrada de ${row.visitorName} registrada · ${clock}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la entrada');
    } finally {
      setBusy(false);
    }
  };

  const authorized = row.visitStatusCode === 'authorized';
  const who = row.authorizedByName || row.residentName;

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={busy}
      layer="over"
      eyebrow="Registrar entrada"
      title={row.visitorName}
      subtitle={<span className={dsMono}>{[formatDoc(row.visitorDni), row.visitTypeName, row.scheduledStartTime ? `programada ${formatWallTime(row.scheduledStartTime)}` : ''].filter(Boolean).join(' · ')}</span>}
    >
      <div className="flex flex-col gap-4">
        {error && <VtNotice tone="error">{error}</VtNotice>}
        <div className="rounded-2xl bg-[#f5f5f4] px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className={`${dsMono} text-base font-semibold`}>{unitLabel(row.propertyUnitBlock, row.propertyUnitNumber)}</div>
            <div className="text-xs text-[#8a8580] truncate">{who ? `Autorizó ${who}` : 'Sin residente que autorice'}</div>
          </div>
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: authorized ? '#1f8a4c' : '#c8603f' }}>
            {authorized ? '✓ Autorizada' : 'Sin autorizar'}
          </span>
        </div>

        <div>
          <div className={`${dsMono} text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580] mb-2`} id="entry-gate-label">
            Puerta
          </div>
          <div role="radiogroup" aria-labelledby="entry-gate-label" className="grid grid-cols-3 gap-1 rounded-full bg-[#efedea] p-1">
            {ENTRY_GATES.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={gate === g}
                onClick={() => setGate(g)}
                className={`h-10 max-md:h-11 rounded-full text-[13px] font-medium ${gate === g ? 'bg-white text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,.08)] font-semibold' : 'text-[#6b6a66]'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-[13px]">
          <input type="checkbox" className="h-4 w-4 accent-[#1a1a1a]" checked={docChecked} onChange={(e) => setDocChecked(e.target.checked)} />
          Documento verificado
        </label>

        <div className="flex flex-col gap-2 pt-1">
          <button type="button" className={`${vtBtn.primary} h-14! text-[15px]! w-full`} onClick={confirm} disabled={busy}>
            {busy ? 'Registrando…' : `Confirmar entrada · ${clock}`}
          </button>
          <button type="button" className={`${vtBtn.ghost} w-full`} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
        </div>
      </div>
    </VtDialog>
  );
}
