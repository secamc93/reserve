/**
 * A7 · Registrar el voto de una unidad (admin, presencial).
 * Ficha de la unidad (o buscador de unidades sin votar), botones grandes por
 * opción con su color y "Guardar: <opción>". Si la unidad no tiene asistencia,
 * ofrece marcarla y registrar el voto (regla del back: con lista activa solo
 * votan unidades con asistencia).
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { createVoteAction, getUnvotedUnitsAction, markUnitAttendanceAction } from '../infrastructure/actions';
import type { UnvotedUnit } from '../infrastructure/actions';
import {
  VT,
  VtDialog,
  VtIcon,
  VtNotice,
  buildOptionPalette,
  formatOrder,
  formatPct,
  getOptionKind,
  vtBtn,
  vtInput,
  vtLabel,
  vtMono,
  vtDialogFooter,
} from './design';

interface VoteModalOption {
  id: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
  color?: string;
  isActive?: boolean;
}

/** Datos de la unidad que muestra la ficha (coeficiente y asistencia). */
export interface VoteUnitInfo {
  coefPct?: number;
  hasAttendance?: boolean;
}

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  groupId: number;
  votingId: number;
  votingTitle: string;
  /** Orden de la votación ("VOTACIÓN 01 · REGISTRO MANUAL"). */
  displayOrder?: number;
  /** @deprecated Se conserva por compatibilidad; ya no se muestra. */
  votingType?: string;
  /** @deprecated Se conserva por compatibilidad; las opciones ya incluyen la abstención si existe. */
  allowAbstention?: boolean;
  options: VoteModalOption[];
  /** Votos ya registrados (para no ofrecer unidades que ya votaron). */
  currentVotes?: Array<{ property_unit_id: number; voted_at?: string }>;
  /** Unidad elegida desde la ficha del panel. */
  preselectedUnit?: {
    propertyUnitId: number;
    residentId?: number | null;
    unitNumber: string;
    residentName: string;
  };
  /** Coeficiente (% del total) y asistencia por id de unidad. */
  unitInfo?: Record<number, VoteUnitInfo>;
}

interface SelectedUnit {
  id: number;
  number: string;
  residentName: string;
}

const isAttendanceError = (message: string) => /asistencia|attendance/i.test(message);

const friendlyError = (message: string) => {
  if (/ya vot|already/i.test(message)) return 'Esta unidad ya votó en esta votación.';
  if (/no corresponde|no pertenece/i.test(message)) return 'La unidad o la opción no corresponden a esta votación.';
  if (/inactiv/i.test(message)) return 'La votación no está abierta.';
  if (/token/i.test(message)) return 'La sesión expiró. Inicia sesión de nuevo.';
  return message || 'No se pudo registrar el voto.';
};

export function VoteModal({
  isOpen,
  onClose,
  onSuccess,
  businessId,
  groupId,
  votingId,
  votingTitle,
  displayOrder,
  options,
  currentVotes = [],
  preselectedUnit,
  unitInfo = {},
}: VoteModalProps) {
  const [unit, setUnit] = useState<SelectedUnit | null>(null);
  const [search, setSearch] = useState('');
  const [unvoted, setUnvoted] = useState<UnvotedUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [optionId, setOptionId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAttendance, setNeedsAttendance] = useState(false);

  const activeOptions = useMemo(
    () => [...options].filter((o) => o.isActive !== false).sort((a, b) => a.displayOrder - b.displayOrder),
    [options]
  );
  const palette = useMemo(
    () => buildOptionPalette(activeOptions.map((o) => ({ id: o.id, text: o.optionText, code: o.optionCode, color: o.color }))),
    [activeOptions]
  );

  // Al abrir: unidad preseleccionada (desde la ficha) o buscador
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setNeedsAttendance(false);
    setOptionId(null);
    setSearch('');
    setUnit(
      preselectedUnit
        ? { id: preselectedUnit.propertyUnitId, number: preselectedUnit.unitNumber, residentName: preselectedUnit.residentName }
        : null
    );
    // La ficha se recrea en cada render del panel: basta con el id de la unidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, preselectedUnit?.propertyUnitId]);

  // Unidades sin votar (para el buscador)
  useEffect(() => {
    if (!isOpen || unit) return;
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    let cancelled = false;
    setLoadingUnits(true);
    const handle = setTimeout(async () => {
      try {
        const res = await getUnvotedUnitsAction({ businessId, groupId, votingId, token, unitNumber: search.trim() || undefined });
        if (cancelled) return;
        const voted = new Set(currentVotes.map((v) => v.property_unit_id));
        setUnvoted((res.success && res.data ? res.data : []).filter((u) => !voted.has(u.unit_id)));
      } finally {
        if (!cancelled) setLoadingUnits(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // currentVotes cambia con cada voto del SSE; basta con recargar al abrir o buscar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, unit, search, businessId, groupId, votingId]);

  const selectedOption = activeOptions.find((o) => o.id === optionId) || null;
  const info = unit ? unitInfo[unit.id] : undefined;

  const submit = async (markAttendanceFirst = false) => {
    if (!unit || !optionId) return;
    const token = TokenStorage.getBusinessToken();
    if (!token) return setError('No se encontró el token de autenticación');
    setSaving(true);
    setError(null);
    try {
      if (markAttendanceFirst) {
        const att = await markUnitAttendanceAction({ token, businessId, groupId, votingId, unitId: unit.id, markAttendance: true });
        if (!att.success) throw new Error(att.error || 'No se pudo marcar la asistencia');
      }
      const res = await createVoteAction({
        token,
        businessId,
        groupId,
        votingId,
        data: { votingId, votingOptionId: optionId, propertyUnitId: unit.id, ipAddress: 'admin-panel', userAgent: navigator.userAgent },
      });
      if (!res.success) {
        const message = res.error || '';
        if (!markAttendanceFirst && isAttendanceError(message)) {
          setNeedsAttendance(true);
          return;
        }
        throw new Error(message);
      }
      setNeedsAttendance(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog
      open={isOpen}
      onClose={onClose}
      busy={saving}
      width={480}
      layer="over"
      eyebrow={`Votación ${formatOrder(displayOrder ?? 1)} · Registro manual`}
      title="Registrar voto"
      subtitle={votingTitle}
    >
      {/* Unidad */}
      {unit ? (
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl" style={{ border: `1px solid ${VT.border}`, background: '#faf9f7' }}>
          <span className={`${vtMono} text-base font-semibold`}>{unit.number}</span>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[13px] font-semibold truncate">{unit.residentName || 'Sin residente'}</div>
            <div className="text-xs" style={{ color: VT.muted }}>
              {info?.coefPct != null ? `coef ${formatPct(info.coefPct)}%` : 'coeficiente —'}
              {info?.hasAttendance === true ? ' · presente' : info?.hasAttendance === false ? ' · sin asistencia' : ''}
            </div>
          </div>
          <button
            type="button"
            className="text-xs underline underline-offset-2 max-md:min-h-11 max-md:px-2 max-md:text-sm"
            style={{ color: VT.muted }}
            onClick={() => {
              setUnit(null);
              setNeedsAttendance(false);
            }}
            disabled={saving}
          >
            cambiar
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="vote-unit-search" className={vtLabel}>Unidad</label>
          <div className="relative">
            <input
              id="vote-unit-search"
              className={`${vtInput} ${vtMono} pr-9`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Número de unidad (ej. T2-804)"
              autoComplete="off"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: VT.muted }}>
              <VtIcon name="search" size={16} />
            </span>
          </div>
          <div
            role="listbox"
            aria-label="Unidades sin votar"
            className="mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-white"
            style={{ border: `1px solid ${VT.border}` }}
          >
            {loadingUnits ? (
              <div className="px-3.5 py-3 text-[13px]" style={{ color: VT.muted }}>Buscando unidades…</div>
            ) : unvoted.length === 0 ? (
              <div className="px-3.5 py-3 text-[13px]" style={{ color: VT.muted }}>
                {search ? 'No hay unidades sin votar con ese número.' : 'Todas las unidades ya votaron.'}
              </div>
            ) : (
              unvoted.slice(0, 50).map((u) => (
                <button
                  key={u.unit_id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => setUnit({ id: u.unit_id, number: u.unit_number, residentName: u.resident_name || '' })}
                  className="w-full flex justify-between items-center px-3.5 py-2.5 max-md:py-3.5 max-md:text-sm text-left text-[13px] hover:bg-[#f5f5f4]"
                  style={{ borderBottom: `1px solid #efedea` }}
                >
                  <span className={`${vtMono} font-medium`}>{u.unit_number}</span>
                  <span className="text-xs truncate ml-3" style={{ color: VT.muted }}>
                    {u.resident_name || 'Sin residente'}
                    {unitInfo[u.unit_id]?.hasAttendance === false ? ' · sin asistencia' : ''}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Opciones */}
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Opción de voto">
        {activeOptions.length === 0 && <VtNotice tone="info">Esta votación no tiene opciones activas.</VtNotice>}
        {activeOptions.map((option) => {
          const color = palette.byId(option.id) || palette.forText(option.optionText, option.color);
          const abstain = getOptionKind(option.optionText, option.optionCode) === 'abstain';
          const selected = optionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={saving}
              onClick={() => setOptionId(option.id)}
              className="h-[52px] rounded-2xl flex items-center justify-between px-4 text-base font-semibold text-left transition-colors disabled:opacity-60"
              style={
                selected
                  ? { background: color, color: '#fff', border: `1.5px solid ${color}` }
                  : { background: '#fff', color: abstain ? VT.inkSoft : color, border: `1.5px solid ${abstain ? VT.pendingBorder : color}` }
              }
            >
              <span>{option.optionText}</span>
              {selected && <VtIcon name="check" size={18} strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>

      {needsAttendance && unit && (
        <VtNotice>
          <div className="flex flex-col gap-2">
            <span>
              La unidad {unit.number} no tiene asistencia registrada. Con lista de asistencia activa solo votan las unidades
              presentes.
            </span>
            <button type="button" className={`${vtBtn.primary} self-start`} onClick={() => submit(true)} disabled={saving}>
              {saving ? 'Registrando…' : 'Marcar presente y guardar el voto'}
            </button>
          </div>
        </VtNotice>
      )}
      {error && <VtNotice>{error}</VtNotice>}

      <div className={vtDialogFooter} style={{ borderTop: `1px solid ${VT.border}` }}>
        <button type="button" className={vtBtn.ghost} onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button type="button" className={vtBtn.primary} onClick={() => submit(false)} disabled={saving || !unit || !selectedOption}>
          {saving ? 'Guardando…' : selectedOption ? `Guardar: ${selectedOption.optionText}` : 'Elige una opción'}
        </button>
      </div>
    </VtDialog>
  );
}
