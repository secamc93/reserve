/**
 * Horario semanal y bloqueos de una zona (diálogo de 560 px). Sin horario la zona no se
 * puede reservar: el back valida cada reserva contra el horario del día y los bloqueos.
 */

'use client';

import { useEffect, useState } from 'react';
import { DsEyebrow, VtDialog, VtIcon, VtNotice, VtSwitch, dsMono, vtBtn, vtInput, vtLabel } from '@/shared/ui/ds';
import type { CommonAreaRestriction, RestrictionType } from '../domain';
import { createRestrictionAction, deleteRestrictionAction, getRestrictionsAction, getSchedulesAction, setSchedulesAction } from '../infrastructure/actions';
import {
  DAY_LONG,
  RESTRICTION_LABEL,
  restrictionToDTO,
  scheduleRows,
  toISODate,
  validateRestriction,
  validateScheduleRows,
  type RestrictionFormState,
  type ScheduleRow,
} from './design';

export interface AreaScheduleModalProps {
  open: boolean;
  businessId: number;
  area: { id: number; name: string } | null;
  getToken: () => Promise<string>;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const emptyRestriction = (): RestrictionFormState => {
  const today = toISODate(new Date());
  return { restrictionType: 'maintenance', startDate: today, endDate: today, allDay: true, startTime: '08:00', endTime: '12:00', reason: '' };
};

const timeInput = `${vtInput} !h-9 !w-[96px] ${dsMono} text-[13px]`;

export function AreaScheduleModal({ open, businessId, area, getToken, onClose, onSaved }: AreaScheduleModalProps) {
  const [rows, setRows] = useState<ScheduleRow[]>(scheduleRows([]));
  const [restrictions, setRestrictions] = useState<CommonAreaRestriction[]>([]);
  const [draft, setDraft] = useState<RestrictionFormState>(emptyRestriction());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !area) return;
    let cancelled = false;
    setError(null);
    setNotice(null);
    setDraft(emptyRestriction());
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const [sched, restr] = await Promise.all([
          getSchedulesAction({ token, businessId, id: area.id }),
          getRestrictionsAction({ token, businessId, id: area.id }),
        ]);
        if (cancelled) return;
        setRows(scheduleRows(sched.success ? sched.data : []));
        setRestrictions(restr.success ? restr.data : []);
        if (!sched.success) setError(sched.error);
        else if (!restr.success) setError(restr.error);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar el horario');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, area, businessId, getToken]);

  const updateRow = (day: number, patch: Partial<ScheduleRow>) => setRows((rs) => rs.map((r) => (r.dayOfWeek === day ? { ...r, ...patch } : r)));

  const saveSchedule = async () => {
    if (!area) return;
    const invalid = validateScheduleRows(rows);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await setSchedulesAction({ token, businessId, id: area.id, schedules: rows });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRows(scheduleRows(result.data));
      onSaved(`Horario de "${area.name}" guardado`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el horario');
    } finally {
      setSaving(false);
    }
  };

  const addRestriction = async () => {
    if (!area) return;
    const invalid = validateRestriction(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await createRestrictionAction({ token, businessId, id: area.id, data: restrictionToDTO(draft) });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRestrictions((rs) => [...rs, result.data].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setDraft(emptyRestriction());
      setNotice('Bloqueo agregado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el bloqueo');
    } finally {
      setSaving(false);
    }
  };

  const removeRestriction = async (r: CommonAreaRestriction) => {
    if (!area) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await deleteRestrictionAction({ token, businessId, id: area.id, restrictionId: r.id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRestrictions((rs) => rs.filter((x) => x.id !== r.id));
      setNotice('Bloqueo eliminado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el bloqueo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow="Horario y bloqueos"
      title={area?.name ?? 'Zona'}
      subtitle="Las reservas solo se aceptan dentro del horario y fuera de los bloqueos"
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cerrar
          </button>
          <button type="button" className={vtBtn.primary} onClick={saveSchedule} disabled={saving || loading}>
            {saving ? 'Guardando…' : 'Guardar horario'}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-[#8a8580]">Cargando…</div>
      ) : (
        <div className="flex flex-col gap-5">
          {error && <VtNotice>{error}</VtNotice>}
          {notice && !error && <VtNotice tone="ok">{notice}</VtNotice>}

          <section aria-label="Horario semanal">
            <DsEyebrow className="mb-1.5">Horario semanal</DsEyebrow>
            <div className="flex flex-col">
              {rows.map((r) => {
                const day = DAY_LONG[r.dayOfWeek];
                return (
                  <div key={r.dayOfWeek} className="flex items-center gap-3 py-1.5 border-b border-[#efedea] last:border-b-0">
                    <VtSwitch checked={r.isActive} onChange={(v) => updateRow(r.dayOfWeek, { isActive: v })} label={`Abrir el ${day.toLowerCase()}`} />
                    <span className="w-[84px] text-[13px] font-medium">{day}</span>
                    {r.isActive ? (
                      <div className="flex items-center gap-1.5">
                        <input type="time" aria-label={`Apertura ${day}`} className={timeInput} value={r.startTime} onChange={(e) => updateRow(r.dayOfWeek, { startTime: e.target.value })} />
                        <span className="text-[#8a8580]">–</span>
                        <input type="time" aria-label={`Cierre ${day}`} className={timeInput} value={r.endTime} onChange={(e) => updateRow(r.dayOfWeek, { endTime: e.target.value })} />
                      </div>
                    ) : (
                      <span className="text-xs text-[#8a8580]">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-label="Bloqueos">
            <DsEyebrow className="mb-1.5">Bloqueos programados</DsEyebrow>
            {restrictions.length === 0 ? (
              <p className="text-xs text-[#8a8580] m-0 mb-2">Sin bloqueos vigentes.</p>
            ) : (
              <ul className="list-none m-0 p-0 mb-3 flex flex-col gap-1.5">
                {restrictions.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-md border border-[#e4e2dd] px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold">
                        {RESTRICTION_LABEL[r.restrictionType] ?? r.restrictionType}
                        {r.reason && <span className="font-normal text-[#4b4a46]"> · {r.reason}</span>}
                      </div>
                      <div className={`${dsMono} text-[11px] text-[#8a8580]`}>
                        {r.startDate === r.endDate ? r.startDate : `${r.startDate} → ${r.endDate}`}
                        {r.startTime ? ` · ${r.startTime}–${r.endTime}` : ' · todo el día'}
                      </div>
                    </div>
                    <button type="button" className={vtBtn.icon} aria-label={`Eliminar bloqueo ${RESTRICTION_LABEL[r.restrictionType] ?? ''} ${r.startDate}`} onClick={() => removeRestriction(r)} disabled={saving}>
                      <VtIcon name="trash" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-lg bg-[#f5f5f4] p-3 flex flex-col gap-2.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="restriction-type" className={vtLabel}>
                    Motivo
                  </label>
                  <select id="restriction-type" className={vtInput} value={draft.restrictionType} onChange={(e) => setDraft((d) => ({ ...d, restrictionType: e.target.value as RestrictionType }))}>
                    {(Object.keys(RESTRICTION_LABEL) as RestrictionType[]).map((t) => (
                      <option key={t} value={t}>
                        {RESTRICTION_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="restriction-from" className={vtLabel}>
                    Desde
                  </label>
                  <input id="restriction-from" type="date" className={vtInput} value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value, endDate: d.endDate < e.target.value ? e.target.value : d.endDate }))} />
                </div>
                <div>
                  <label htmlFor="restriction-to" className={vtLabel}>
                    Hasta
                  </label>
                  <input id="restriction-to" type="date" className={vtInput} value={draft.endDate} min={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <VtSwitch checked={draft.allDay} onChange={(v) => setDraft((d) => ({ ...d, allDay: v }))} label="Todo el día" />
                <span className="text-[13px]">Todo el día</span>
                {!draft.allDay && (
                  <div className="flex items-center gap-1.5">
                    <input type="time" aria-label="Hora inicial del bloqueo" className={timeInput} value={draft.startTime} onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))} />
                    <span className="text-[#8a8580]">–</span>
                    <input type="time" aria-label="Hora final del bloqueo" className={timeInput} value={draft.endTime} onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))} />
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-2.5">
                <input aria-label="Detalle del bloqueo" className={vtInput} placeholder="Detalle (opcional): pintura, asamblea…" value={draft.reason} maxLength={500} onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))} />
                <button type="button" className={vtBtn.secondary} onClick={addRestriction} disabled={saving}>
                  Agregar bloqueo
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </VtDialog>
  );
}
