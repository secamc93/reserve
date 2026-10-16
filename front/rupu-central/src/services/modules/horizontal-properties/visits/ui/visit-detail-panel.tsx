'use client';

/**
 * V3 · Detalle de visita (Patrón C: panel lateral de 420 px). Visitante, visita, línea de
 * tiempo (registrada → programada → entrada → salida) y acciones de portería: registrar
 * entrada / salida, editar, cancelar, acompañantes, equipos y reservar parqueadero.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DsStatus, DsTag, VtDialog, VtNotice, vtBtn, dsMono } from '@/shared/ui/ds';
import { deleteVisitAction, getVisitByIdAction, registerEntryAction, registerExitAction } from '../infrastructure/actions';
import type { Visit, VisitListDTO } from '../domain';
import { CompanionsModal } from './companions-modal';
import { RegisterAssetsModal } from './register-assets-modal';
import { FieldGrid, PanelSection, SidePanel, Timeline } from './side-panel';
import { useBusinessToken } from './use-business-token';
import {
  VISIT_STATE_META,
  formatDuration,
  formatWallDay,
  formatWallTime,
  minutesBetween,
  unitLabel,
  visitActions,
  visitStateOf,
  visitTimeline,
} from './visit-state';

/** Puerta y método con que la portería registra entradas y salidas manuales. */
export const DEFAULT_GATE = 'Principal';

export interface VisitDetailPanelProps {
  businessId: number;
  row: VisitListDTO | null;
  onClose: () => void;
  /** Algo cambió (entrada, salida, cancelación…): recargar la lista y avisar. */
  onChanged: (message: string) => void;
  onEdit: (visit: Visit, row: VisitListDTO) => void;
}

export function parkingReservationHref(businessId: number, visitId: number): string {
  return `/properties/${businessId}/parking?tab=reservations&visit_id=${visitId}`;
}

export function VisitDetailPanel({ businessId, row, onClose, onChanged, onEdit }: VisitDetailPanelProps) {
  const getToken = useBusinessToken(businessId);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [companionsOpen, setCompanionsOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  // Estado tras una acción, mientras la lista recarga (la fila puede salir del filtro actual)
  const [statusOverride, setStatusOverride] = useState<{ id: number; code: string } | null>(null);

  const rowId = row?.id;
  const load = useCallback(async () => {
    if (!rowId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setVisit(await getVisitByIdAction({ businessId, visitId: rowId, token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la visita');
    } finally {
      setLoading(false);
    }
  }, [rowId, businessId, getToken]);

  useEffect(() => {
    setVisit(null);
    setConfirmCancel(false);
    load();
  }, [load]);

  if (!row) return null;

  // La fila trae nombres y estado; el detalle trae puertas, notas y opciones
  const merged = {
    ...row,
    visitStatusCode: statusOverride?.id === row.id ? statusOverride.code : row.visitStatusCode,
    actualEntryTime: visit?.actualEntryTime ?? row.actualEntryTime,
    actualExitTime: visit?.actualExitTime ?? row.actualExitTime,
    entryGate: visit?.entryGate,
    exitGate: visit?.exitGate,
  };
  const state = visitStateOf(merged);
  const meta = VISIT_STATE_META[state];
  const actions = visitActions(merged);
  const unit = unitLabel(row.propertyUnitBlock, row.propertyUnitNumber);

  const run = async (fn: (token: string) => Promise<unknown>, message: string, nextCode: string) => {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      await fn(token);
      setStatusOverride({ id: row.id, code: nextCode });
      onChanged(message);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  };

  const registerEntry = () =>
    run(
      (token) => registerEntryAction({ businessId, visitId: row.id, data: { gate: DEFAULT_GATE, method: 'manual' }, token }),
      `Entrada de ${row.visitorName} registrada`,
      'in_progress',
    );
  const registerExit = () =>
    run((token) => registerExitAction({ businessId, visitId: row.id, data: { gate: DEFAULT_GATE }, token }), `Salida de ${row.visitorName} registrada`, 'completed');
  const cancelVisit = async () => {
    await run((token) => deleteVisitAction({ businessId, visitId: row.id, token }), `Visita de ${row.visitorName} cancelada`, 'cancelled');
    setConfirmCancel(false);
  };

  const stay = merged.actualEntryTime ? formatDuration(minutesBetween(merged.actualEntryTime, merged.actualExitTime || new Date())) : '';

  return (
    <>
      <SidePanel
        open
        onClose={onClose}
        busy={busy}
        eyebrow={`Visita · ${unit}`}
        title={row.visitorName}
        subtitle={
          <span className={dsMono}>
            {row.visitorDni}
            {row.visitorPhone ? ` · ${row.visitorPhone}` : ''}
          </span>
        }
        status={
          <div className="flex flex-wrap items-center gap-2">
            <DsStatus label={meta.label} color={meta.color} />
            {state === 'inside' && stay && <span className="text-xs text-[#8a8580]">hace {stay}</span>}
            {visit?.durationExceeded && <DsTag strong>Tiempo excedido</DsTag>}
          </div>
        }
        footer={
          <>
            {actions.canEnter && (
              <button type="button" className={vtBtn.primary} onClick={registerEntry} disabled={busy}>
                {busy ? 'Registrando…' : 'Registrar entrada'}
              </button>
            )}
            {actions.canExit && (
              <button type="button" className={vtBtn.primary} onClick={registerExit} disabled={busy}>
                {busy ? 'Registrando…' : 'Registrar salida'}
              </button>
            )}
            {actions.canEdit && visit && (
              <button type="button" className={vtBtn.secondary} onClick={() => onEdit(visit, row)} disabled={busy}>
                Editar
              </button>
            )}
            {actions.canCancel && (
              <button type="button" className={vtBtn.ghost} onClick={() => setConfirmCancel(true)} disabled={busy}>
                Cancelar visita
              </button>
            )}
          </>
        }
      >
        {error && <VtNotice tone="error">{error}</VtNotice>}

        <PanelSection label="Visita">
          <FieldGrid
            items={[
              { label: 'Unidad', value: unit },
              { label: 'Tipo', value: row.visitTypeName },
              { label: 'Día', value: formatWallDay(row.scheduledDate) },
              {
                label: 'Horario',
                value: [formatWallTime(row.scheduledStartTime), formatWallTime(row.scheduledEndTime)].filter(Boolean).join(' – '),
                mono: true,
              },
              { label: 'Personas', value: String(row.numberOfVisitors ?? visit?.numberOfVisitors ?? 1), mono: true },
              { label: 'Código', value: visit?.authorizationCode, mono: true },
              { label: 'Motivo', value: row.purpose || visit?.purpose, full: true },
              ...(visit?.notes ? [{ label: 'Notas', value: visit.notes, full: true }] : []),
            ]}
          />
          {visit && (visit.hasCompanions || visit.hasAssets || visit.notifyResident || visit.notifySecurity) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {visit.hasCompanions && <DsTag>Con acompañantes</DsTag>}
              {visit.hasAssets && <DsTag>Ingresa equipos</DsTag>}
              {visit.notifyResident && <DsTag>Avisar residente</DsTag>}
              {visit.notifySecurity && <DsTag>Avisar seguridad</DsTag>}
            </div>
          )}
        </PanelSection>

        <PanelSection label="Línea de tiempo">
          {loading && !visit ? <div className="text-[13px] text-[#8a8580]">Cargando…</div> : <Timeline steps={visitTimeline(merged)} />}
        </PanelSection>

        <PanelSection label="Más">
          <div className="flex flex-col gap-2">
            <button type="button" className={`${vtBtn.small} justify-between`} onClick={() => setCompanionsOpen(true)}>
              Acompañantes <span aria-hidden="true">›</span>
            </button>
            <button type="button" className={`${vtBtn.small} justify-between`} onClick={() => setAssetsOpen(true)}>
              Equipos que ingresa <span aria-hidden="true">›</span>
            </button>
            {(state === 'expected' || state === 'inside') && (
              <Link href={parkingReservationHref(businessId, row.id)} className={`${vtBtn.small} justify-between`}>
                Reservar parqueadero <span aria-hidden="true">›</span>
              </Link>
            )}
          </div>
        </PanelSection>
      </SidePanel>

      <VtDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        busy={busy}
        layer="over"
        eyebrow="Cancelar visita"
        title={`¿Cancelar la visita de ${row.visitorName}?`}
        subtitle={`${unit} · ${formatWallDay(row.scheduledDate)} ${formatWallTime(row.scheduledStartTime)}`}
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setConfirmCancel(false)} disabled={busy}>
              No, mantener
            </button>
            <button type="button" className={vtBtn.primary} onClick={cancelVisit} disabled={busy}>
              {busy ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
          </>
        }
      >
        <p className="m-0 text-[13px] text-[#4b4a46]">La portería ya no la verá como esperada. No se puede deshacer.</p>
      </VtDialog>

      <CompanionsModal isOpen={companionsOpen} onClose={() => setCompanionsOpen(false)} onSuccess={load} visitId={row.id} businessId={businessId} />
      <RegisterAssetsModal
        isOpen={assetsOpen}
        onClose={() => setAssetsOpen(false)}
        onSuccess={() => {
          setAssetsOpen(false);
          load();
        }}
        visitId={row.id}
        businessId={businessId}
      />
    </>
  );
}
