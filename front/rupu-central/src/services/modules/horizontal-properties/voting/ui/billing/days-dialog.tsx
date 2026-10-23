/**
 * Diálogo para elegir fechas de votación: comprarlas (Wompi) o, para el super admin, otorgarlas
 * (pago manual o cortesía).
 */

'use client';

import { useEffect, useState } from 'react';
import { formatCop, formatVotingDate } from '../../domain/entities';
import { VtDialog, VtNotice, vtBtn, vtInput } from '../design';

export type DaysDialogMode = 'buy' | 'grant';

interface DaysDialogProps {
  open: boolean;
  mode: DaysDialogMode;
  initialDates: string[];
  today: string;
  pricePerDayCop: number;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (dates: string[], grant?: { source: 'manual' | 'cortesia'; notes: string }) => void;
}

export function DaysDialog({ open, mode, initialDates, today, pricePerDayCop, busy, error, onClose, onSubmit }: DaysDialogProps) {
  const [dates, setDates] = useState<string[]>(initialDates);
  const [draft, setDraft] = useState('');
  const [source, setSource] = useState<'manual' | 'cortesia'>('cortesia');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setDates([...initialDates].sort());
      setDraft('');
    }
  }, [open, initialDates]);

  const add = () => {
    if (draft && draft >= today && !dates.includes(draft) && dates.length < 31) setDates([...dates, draft].sort());
    setDraft('');
  };
  const total = mode === 'grant' && source === 'cortesia' ? 0 : dates.length * pricePerDayCop;

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={busy}
      eyebrow={mode === 'buy' ? 'Días de votación' : 'Super admin'}
      title={mode === 'buy' ? 'Comprar días de votación' : 'Otorgar días de votación'}
      subtitle={`Cada día cubre todas las votaciones de ese día. ${formatCop(pricePerDayCop)} por día.`}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={busy}>Cancelar</button>
          <button
            type="button"
            className={vtBtn.primary}
            disabled={busy || dates.length === 0}
            onClick={() => onSubmit(dates, mode === 'grant' ? { source, notes } : undefined)}
          >
            {busy ? 'Procesando…' : mode === 'buy' ? `Pagar ${formatCop(total)} con Wompi` : `Otorgar ${dates.length} ${dates.length === 1 ? 'día' : 'días'}`}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {error && <VtNotice>{error}</VtNotice>}
        <div className="flex flex-wrap gap-2" aria-label="Fechas elegidas">
          {dates.length === 0 && <span className="text-[13px]" style={{ color: '#8a8580' }}>Aún no eliges fechas.</span>}
          {dates.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px]" style={{ borderColor: '#d6d3cd' }}>
              {formatVotingDate(d)}
              <button type="button" aria-label={`Quitar ${formatVotingDate(d)}`} onClick={() => setDates(dates.filter((x) => x !== d))}>×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="date" aria-label="Agregar fecha" className={vtInput} min={today} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="button" className={vtBtn.secondary} onClick={add} disabled={!draft}>Agregar</button>
        </div>
        {mode === 'grant' && (
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium">
              Origen
              <select className={`${vtInput} mt-1`} value={source} onChange={(e) => setSource(e.target.value as 'manual' | 'cortesia')}>
                <option value="cortesia">Cortesía (sin cobro)</option>
                <option value="manual">Pago manual (Nequi, transferencia…)</option>
              </select>
            </label>
            <label className="text-[13px] font-medium">
              Notas
              <input className={`${vtInput} mt-1`} value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} placeholder="Motivo o referencia del pago" />
            </label>
          </div>
        )}
        <div className="text-[13px] font-semibold">
          Total: {formatCop(total)} · {dates.length} {dates.length === 1 ? 'día' : 'días'}
        </div>
      </div>
    </VtDialog>
  );
}
