'use client';

/**
 * V3 · Detalle de visita (panel lateral de 460 px sobre la lista atenuada).
 * Cabecera: "VISITA #id · CÓD. AUT. …", avatar con iniciales, nombre, documento y placa,
 * unidad · tipo · estado. Cuerpo: línea de tiempo, tarjetas "Autorizó" y "Activos declarados"
 * y la nota de portería. Pie: registrar salida / entrada (44 px), imprimir y más acciones.
 */

import { useCallback, useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DsEyebrow, VtDialog, VtNotice, vtBtn, vtTextarea, dsMono } from '@/shared/ui/ds';
import { deleteVisitAction, getVisitAssetsAction, getVisitByIdAction, registerExitAction, updateVisitAction } from '../infrastructure/actions';
import type { Visit, VisitAssetItem, VisitListDTO } from '../domain';
import { CompanionsModal } from './companions-modal';
import { RegisterAssetsModal } from './register-assets-modal';
import { PanelSection, SidePanel, Timeline } from './side-panel';
import { useBusinessToken } from './use-business-token';
import {
  formatDoc,
  formatDuration,
  formatWallDay,
  formatWallTime,
  initials,
  minutesBetween,
  unitLabel,
  visitActions,
  visitStateOf,
  visitStatusDisplay,
  visitTimeline,
} from './visit-state';

/** Puerta con que la portería registra salidas cuando la entrada no la guardó. */
export const DEFAULT_GATE = 'Principal';

export interface VisitDetailPanelProps {
  businessId: number;
  row: VisitListDTO | null;
  onClose: () => void;
  /** Algo cambió (salida, cancelación, nota…): recargar la lista y avisar. */
  onChanged: (message: string) => void;
  onEdit: (visit: Visit, row: VisitListDTO) => void;
  /** Abrir "Registrar entrada" (elige la puerta). */
  onRequestEntry: (row: VisitListDTO) => void;
}

export function parkingReservationHref(businessId: number, visitId: number): string {
  return `/properties/${businessId}/parking?tab=reservations&visit_id=${visitId}`;
}

export function VisitDetailPanel({ businessId, row, onClose, onChanged, onEdit, onRequestEntry }: VisitDetailPanelProps) {
  const router = useRouter();
  const getToken = useBusinessToken(businessId);
  const noteId = useId();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [assets, setAssets] = useState<VisitAssetItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [companionsOpen, setCompanionsOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  // Estado tras una acción, mientras la lista recarga (la fila puede salir de la pestaña actual)
  const [statusOverride, setStatusOverride] = useState<{ id: number; code: string } | null>(null);

  const rowId = row?.id;
  const load = useCallback(async () => {
    if (!rowId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const [detail, items] = await Promise.all([
        getVisitByIdAction({ businessId, visitId: rowId, token }),
        getVisitAssetsAction({ businessId, visitId: rowId, token }).catch(() => null),
      ]);
      setVisit(detail);
      setNote(detail.notes ?? '');
      setAssets(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la visita');
    } finally {
      setLoading(false);
    }
  }, [rowId, businessId, getToken]);

  useEffect(() => {
    setVisit(null);
    setAssets(null);
    setNote('');
    setConfirmCancel(false);
    load();
  }, [load]);

  if (!row) return null;

  // La fila trae nombres y estado; el detalle trae puertas, notas y opciones
  const merged: VisitListDTO & { entryGate?: string; exitGate?: string } = {
    ...row,
    visitStatusCode: statusOverride?.id === row.id ? statusOverride.code : row.visitStatusCode,
    actualEntryTime: visit?.actualEntryTime ?? row.actualEntryTime,
    actualExitTime: visit?.actualExitTime ?? row.actualExitTime,
    entryGate: visit?.entryGate || row.entryGate,
    exitGate: visit?.exitGate,
  };
  const state = visitStateOf(merged);
  const status = visitStatusDisplay(merged);
  const actions = visitActions(merged);
  const unit = unitLabel(row.propertyUnitBlock, row.propertyUnitNumber);
  const code = row.authorizationCode || visit?.authorizationCode;
  const stay = merged.actualEntryTime && !merged.actualExitTime ? formatDuration(minutesBetween(merged.actualEntryTime)) : '';
  const authorizer = row.authorizedByName || row.residentName;
  const noteEditable = state === 'expected' || state === 'inside';

  const run = async (fn: (token: string) => Promise<unknown>, message: string, nextCode?: string) => {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      await fn(token);
      if (nextCode) setStatusOverride({ id: row.id, code: nextCode });
      onChanged(message);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  };

  const registerExit = () =>
    run(
      (token) => registerExitAction({ businessId, visitId: row.id, data: { gate: merged.entryGate || DEFAULT_GATE }, token }),
      `Salida de ${row.visitorName} registrada`,
      'completed',
    );
  const cancelVisit = async () => {
    await run((token) => deleteVisitAction({ businessId, visitId: row.id, token }), `Visita de ${row.visitorName} cancelada`, 'cancelled');
    setConfirmCancel(false);
  };
  const saveNote = () => run((token) => updateVisitAction({ businessId, visitId: row.id, data: { notes: note.trim() }, token }), 'Nota de portería guardada');

  const moreItems: { label: string; onSelect: () => void; danger?: boolean }[] = [
    ...(actions.canEdit && visit ? [{ label: 'Editar visita', onSelect: () => onEdit(visit, row) }] : []),
    { label: 'Acompañantes', onSelect: () => setCompanionsOpen(true) },
    ...(state === 'expected' || state === 'inside' ? [{ label: 'Reservar parqueadero', onSelect: () => router.push(parkingReservationHref(businessId, row.id)) }] : []),
    ...(actions.canCancel ? [{ label: 'Cancelar visita', onSelect: () => setConfirmCancel(true), danger: true }] : []),
  ];

  return (
    <>
      <SidePanel
        open
        onClose={onClose}
        busy={busy}
        eyebrow={`Visita #${row.id}${code ? ` · Cód. aut. ${code}` : ''}`}
        avatar={
          <div className={`${dsMono} w-11 h-11 rounded-full bg-[#E3F5F5] text-[#0C6B76] flex items-center justify-center text-sm font-semibold shrink-0`} aria-hidden="true">
            {initials(row.visitorName)}
          </div>
        }
        title={row.visitorName}
        subtitle={<span className={dsMono}>{[formatDoc(row.visitorDni), row.visitorVehiclePlate ? `placa ${row.visitorVehiclePlate}` : ''].filter(Boolean).join(' · ')}</span>}
        status={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <span>
              <span className="text-[#8a8580]">Unidad </span>
              <span className={`${dsMono} font-semibold`}>{unit}</span>
            </span>
            <span className="text-[#4b4a46]">{row.visitTypeName}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: status.color }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: status.dot }} />
              {status.label}
              {stay ? ` · ${stay}` : ''}
            </span>
          </div>
        }
        footer={
          <>
            {actions.canExit && (
              <button type="button" className={`${vtBtn.primary} h-11! flex-1 text-sm!`} onClick={registerExit} disabled={busy}>
                {busy ? 'Registrando…' : 'Registrar salida'}
              </button>
            )}
            {actions.canEnter && (
              <button type="button" className={`${vtBtn.primary} h-11! flex-1 text-sm!`} onClick={() => onRequestEntry(merged)} disabled={busy}>
                Registrar entrada
              </button>
            )}
            <button type="button" className={`${vtBtn.secondary} h-11!`} onClick={() => window.print()}>
              Imprimir
            </button>
          </>
        }
      >
        {error && <VtNotice tone="error">{error}</VtNotice>}

        <PanelSection label="Línea de tiempo">
          {loading && !visit ? <div className="text-[13px] text-[#8a8580]">Cargando…</div> : <Timeline steps={visitTimeline(merged)} />}
        </PanelSection>

        <div className="grid grid-cols-2 gap-2.5">
          <section aria-label="Autorizó" className="rounded-2xl border border-[#e4e2dd] px-3.5 py-3 min-w-0">
            <DsEyebrow className="mb-1.5">Autorizó</DsEyebrow>
            <div className="text-[13px] font-semibold truncate">{authorizer || 'Sin registro'}</div>
            <div className="text-[11px] text-[#8a8580] truncate">{authorizer ? `Residente · ${unit}` : `${formatWallDay(row.scheduledDate)} ${formatWallTime(row.scheduledStartTime)}`}</div>
          </section>
          <section aria-label="Activos declarados" className="rounded-2xl border border-[#e4e2dd] px-3.5 py-3 min-w-0">
            <DsEyebrow className="mb-1.5">Activos declarados</DsEyebrow>
            {assets && assets.length > 0 ? (
              <ul className="m-0 p-0 list-none text-[13px]">
                {assets.slice(0, 3).map((a) => (
                  <li key={a.id} className="truncate">
                    {a.assetName}
                    {a.assetSerial && <span className={`${dsMono} text-[11px] text-[#8a8580]`}> · {a.assetSerial}</span>}
                  </li>
                ))}
                {assets.length > 3 && <li className="text-[11px] text-[#8a8580]">y {assets.length - 3} más</li>}
              </ul>
            ) : (
              <div className="text-[13px] text-[#8a8580]">Ninguno</div>
            )}
            {noteEditable && (
              <button type="button" className="mt-1 text-[11px] font-semibold text-[#c8603f] hover:underline" onClick={() => setAssetsOpen(true)}>
                + Registrar activos
              </button>
            )}
          </section>
        </div>

        <section>
          <label htmlFor={noteId} className="block">
            <DsEyebrow className="mb-2">Nota de portería</DsEyebrow>
          </label>
          {noteEditable ? (
            <div className="flex flex-col gap-2">
              <textarea id={noteId} rows={3} className={vtTextarea} value={note} placeholder="Llegó con dos acompañantes, dejó la cédula…" onChange={(e) => setNote(e.target.value)} />
              {note.trim() !== (visit?.notes ?? '').trim() && (
                <button type="button" className={`${vtBtn.small} self-end`} onClick={saveNote} disabled={busy}>
                  Guardar nota
                </button>
              )}
            </div>
          ) : (
            <p id={noteId} className="m-0 text-[13px] text-[#4b4a46] whitespace-pre-wrap">
              {visit?.notes || 'Sin nota'}
            </p>
          )}
        </section>

        {moreItems.length > 0 && (
          <PanelSection label="Más acciones">
            <div className="flex flex-col gap-1.5">
              {moreItems.map((i) => (
                <button
                  key={i.label}
                  type="button"
                  className={`${vtBtn.small} justify-between ${i.danger ? 'text-[#c8382d]!' : ''}`}
                  onClick={i.onSelect}
                  disabled={busy}
                >
                  {i.label} <span aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </PanelSection>
        )}
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
