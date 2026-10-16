'use client';

/**
 * P3 · Detalle de paquete y entrega (Patrón C: panel lateral de 420 px). Destino, envío,
 * antigüedad, línea de tiempo y, si está por entregar, la entrega en el mismo panel (notas
 * opcionales) o marcarlo como devuelto.
 */

import { useCallback, useEffect, useId, useState } from 'react';
import { DsStatus, DsTag, VtDialog, VtNotice, vtBtn, vtLabel, vtTextarea, dsMono } from '@/shared/ui/ds';
import { deletePackageAction, deliverPackageAction, getPackageByIdAction } from '../infrastructure/actions';
import type { Package, PackageListDTO } from '../domain';
import { FieldGrid, PanelSection, SidePanel, Timeline } from './side-panel';
import { useBusinessToken } from './use-business-token';
import {
  AGE_COLOR,
  PACKAGE_GROUP_META,
  ageLevel,
  formatAge,
  packageActions,
  packageAgeHours,
  packageGroupOf,
  packageStatusLabel,
  packageTimeline,
  unitLabel,
} from './package-state';

export interface PackageDetailPanelProps {
  businessId: number;
  row: PackageListDTO | null;
  /** Abrir directamente con el formulario de entrega. */
  startDelivering?: boolean;
  onClose: () => void;
  onChanged: (message: string) => void;
}

export function PackageDetailPanel({ businessId, row, startDelivering = false, onClose, onChanged }: PackageDetailPanelProps) {
  const getToken = useBusinessToken(businessId);
  const notesId = useId();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [notes, setNotes] = useState('');
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [override, setOverride] = useState<{ id: number; code: string; deliveredAt?: string } | null>(null);

  const rowId = row?.id;
  const load = useCallback(async () => {
    if (!rowId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setPkg(await getPackageByIdAction({ businessId, packageId: rowId, token }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el paquete');
    } finally {
      setLoading(false);
    }
  }, [rowId, businessId, getToken]);

  useEffect(() => {
    setPkg(null);
    setNotes('');
    setConfirmReturn(false);
    load();
  }, [load]);

  useEffect(() => {
    setDelivering(startDelivering);
  }, [rowId, startDelivering]);

  if (!row) return null;

  const current: PackageListDTO = {
    ...row,
    statusCode: override?.id === row.id ? override.code : pkg?.statusCode || row.statusCode,
    deliveredAt: (override?.id === row.id ? override.deliveredAt : undefined) ?? pkg?.deliveredAt ?? row.deliveredAt,
  };
  const group = packageGroupOf(current);
  const meta = PACKAGE_GROUP_META[group];
  const actions = packageActions(current);
  const hours = packageAgeHours(current);
  const unit = unitLabel(row.propertyUnitBlock, row.propertyUnitNumber);

  const deliver = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      await deliverPackageAction({ businessId, packageId: row.id, data: { notes: notes.trim() || undefined }, token });
      setOverride({ id: row.id, code: 'delivered', deliveredAt: new Date().toISOString() });
      setDelivering(false);
      onChanged(`Paquete de ${unit} entregado`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo entregar el paquete');
    } finally {
      setBusy(false);
    }
  };

  const markReturned = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      await deletePackageAction({ businessId, packageId: row.id, token });
      setOverride({ id: row.id, code: 'returned' });
      setConfirmReturn(false);
      onChanged(`Paquete ${row.trackingNumber} marcado como devuelto`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo marcar como devuelto');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SidePanel
        open
        onClose={onClose}
        busy={busy}
        eyebrow={`Paquete · ${row.carrier || 'Sin transportadora'}`}
        title={unit}
        subtitle={row.residentName || 'Cualquier residente de la unidad'}
        status={
          <div className="flex flex-wrap items-center gap-2">
            <DsStatus label={packageStatusLabel(current)} color={meta.color} />
            <span className={`${dsMono} text-xs`} style={{ color: group === 'pending' ? AGE_COLOR[ageLevel(hours)] : '#8a8580' }}>
              {group === 'pending' ? `hace ${formatAge(hours)}` : `${formatAge(hours)} en portería`}
            </span>
            {group === 'pending' && ageLevel(hours) === 'overdue' && <DsTag strong>Más de 3 días</DsTag>}
          </div>
        }
        footer={
          delivering ? (
            <>
              <button type="button" className={vtBtn.secondary} onClick={() => setDelivering(false)} disabled={busy}>
                Volver
              </button>
              <button type="button" className={vtBtn.primary} onClick={deliver} disabled={busy}>
                {busy ? 'Entregando…' : 'Confirmar entrega'}
              </button>
            </>
          ) : actions.canDeliver || actions.canReturn ? (
            <>
              {actions.canDeliver && (
                <button type="button" className={vtBtn.primary} onClick={() => setDelivering(true)} disabled={busy}>
                  Entregar
                </button>
              )}
              {actions.canReturn && (
                <button type="button" className={vtBtn.ghost} onClick={() => setConfirmReturn(true)} disabled={busy}>
                  Marcar como devuelto
                </button>
              )}
            </>
          ) : undefined
        }
      >
        {error && <VtNotice tone="error">{error}</VtNotice>}

        {delivering && (
          <PanelSection label="Entrega">
            <div className="flex flex-col gap-2">
              <p className="m-0 text-[13px] text-[#4b4a46]">
                Entregar a {row.residentName || `un residente de ${unit}`}. Queda registrado con tu usuario y la hora.
              </p>
              <label htmlFor={notesId} className={vtLabel}>
                Notas de la entrega
              </label>
              <textarea
                id={notesId}
                rows={2}
                className={vtTextarea}
                placeholder="Recibió: nombre de quien recoge, observaciones…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </PanelSection>
        )}

        {!actions.canDeliver && current.statusCode === 'notified' && (
          <VtNotice tone="info">Este paquete está como notificado: la entrega directa no está habilitada para ese estado.</VtNotice>
        )}

        <PanelSection label="Envío">
          <FieldGrid
            items={[
              { label: 'Transportadora', value: row.carrier },
              { label: 'Guía', value: row.trackingNumber, mono: true },
              { label: 'Descripción', value: row.description || pkg?.description, full: true },
              ...(pkg?.qrCode ? [{ label: 'Código QR', value: pkg.qrCode, mono: true, full: true }] : []),
              ...(pkg?.notes ? [{ label: 'Notas', value: pkg.notes, full: true }] : []),
            ]}
          />
        </PanelSection>

        <PanelSection label="Línea de tiempo">
          {loading && !pkg ? (
            <div className="text-[13px] text-[#8a8580]">Cargando…</div>
          ) : (
            <Timeline steps={packageTimeline({ ...current, notificationSentAt: pkg?.notificationSentAt, notifyResident: pkg?.notifyResident })} />
          )}
        </PanelSection>
      </SidePanel>

      <VtDialog
        open={confirmReturn}
        onClose={() => setConfirmReturn(false)}
        busy={busy}
        layer="over"
        eyebrow="Paquetería"
        title="¿Marcar como devuelto?"
        subtitle={`${unit} · ${row.carrier} ${row.trackingNumber}`}
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setConfirmReturn(false)} disabled={busy}>
              No
            </button>
            <button type="button" className={vtBtn.primary} onClick={markReturned} disabled={busy}>
              {busy ? 'Guardando…' : 'Sí, devuelto'}
            </button>
          </>
        }
      >
        <p className="m-0 text-[13px] text-[#4b4a46]">Sale de la lista por entregar. No se puede deshacer.</p>
      </VtDialog>
    </>
  );
}
