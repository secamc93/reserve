'use client';

/**
 * P3 · Detalle y entrega (panel lateral de 460 px). "PAQUETE #id · TRANSPORTADORA", la unidad en
 * grande con el residente, la guía y los días en portería; foto (si la hubiera) y descripción
 * con quién recibió; "Entregar a" con los residentes de la unidad u otra persona; nota y
 * "Confirmar entrega · HH:MM" o "Devolver". Los ya entregados o devueltos muestran su línea de tiempo.
 */

import { useCallback, useEffect, useId, useState } from 'react';
import { DsEyebrow, VtDialog, VtNotice, vtBtn, vtInput, vtLabel, vtTextarea, dsMono } from '@/shared/ui/ds';
import { deletePackageAction, deliverPackageAction, getPackageByIdAction } from '../infrastructure/actions';
import type { Package, PackageListDTO } from '../domain';
import { getResidentsAction } from '@/services/modules/horizontal-properties/residents/infrastructure/actions';
import type { Resident } from '@/services/modules/horizontal-properties/residents/domain';
import { PanelSection, SidePanel, Timeline } from './side-panel';
import { useBusinessToken } from './use-business-token';
import {
  PACKAGE_GROUP_META,
  daysColor,
  deliveryNotes,
  formatClock,
  formatDateTime,
  formatDays,
  packageActions,
  packageDays,
  packageGroupOf,
  packageStatusLabel,
  packageTimeline,
  unitLabel,
} from './package-state';

export interface PackageDetailPanelProps {
  businessId: number;
  row: PackageListDTO | null;
  /** detail: ver; deliver: entregar (igual, con la entrega a mano); return: pedir confirmación para devolver. */
  mode?: 'detail' | 'deliver' | 'return';
  onClose: () => void;
  onChanged: (message: string) => void;
}

const OTHER = -1;

/** Hora actual "HH:MM" que se refresca cada 20 s mientras el panel está abierto. */
function useClock(active: boolean): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(t);
  }, [active]);
  return formatClock(now.toISOString());
}

export function PackageDetailPanel({ businessId, row, mode = 'detail', onClose, onChanged }: PackageDetailPanelProps) {
  const getToken = useBusinessToken(businessId);
  const ids = { note: useId(), otherName: useId(), otherDoc: useId() };
  const clock = useClock(!!row);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [recipient, setRecipient] = useState<number | null>(null);
  const [other, setOther] = useState({ name: '', doc: '' });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [override, setOverride] = useState<{ id: number; code: string; deliveredAt?: string } | null>(null);

  const rowId = row?.id;
  const load = useCallback(async () => {
    if (!rowId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const detail = await getPackageByIdAction({ businessId, packageId: rowId, token });
      setPkg(detail);
      // Residentes de la unidad para "Entregar a"
      getResidentsAction({ businessId, token, propertyUnitId: detail.propertyUnitId, page: 1, pageSize: 20 })
        .then((res) => {
          const list = res.residents || [];
          setResidents(list);
          setRecipient((cur) => cur ?? (list.find((r) => r.id === detail.residentId)?.id ?? list[0]?.id ?? OTHER));
        })
        .catch(() => {
          setResidents([]);
          setRecipient((cur) => cur ?? OTHER);
        });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el paquete');
    } finally {
      setLoading(false);
    }
  }, [rowId, businessId, getToken]);

  useEffect(() => {
    setPkg(null);
    setResidents([]);
    setRecipient(null);
    setOther({ name: '', doc: '' });
    setNote('');
    load();
  }, [load]);

  useEffect(() => {
    setConfirmReturn(mode === 'return');
  }, [rowId, mode]);

  if (!row) return null;

  const current: PackageListDTO = {
    ...row,
    statusCode: override?.id === row.id ? override.code : pkg?.statusCode || row.statusCode,
    deliveredAt: (override?.id === row.id ? override.deliveredAt : undefined) ?? pkg?.deliveredAt ?? row.deliveredAt,
  };
  const group = packageGroupOf(current);
  const actions = packageActions(current);
  const days = packageDays(current);
  const unit = unitLabel(row.propertyUnitBlock, row.propertyUnitNumber);

  const deliver = async () => {
    const resident = residents.find((r) => r.id === recipient);
    const who: { name: string; doc?: string } | null =
      recipient === OTHER ? (other.name.trim() ? { name: other.name.trim(), doc: other.doc.trim() || undefined } : null) : resident ? { name: resident.name } : null;
    if (recipient === OTHER && !other.name.trim()) {
      setError('Escribe el nombre de quien recibe');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      const notes = deliveryNotes(who, note);
      await deliverPackageAction({ businessId, packageId: row.id, data: { notes: notes || undefined }, token });
      setOverride({ id: row.id, code: 'delivered', deliveredAt: new Date().toISOString() });
      onChanged(`Paquete de ${unit} entregado${who ? ` a ${who.name}` : ''}`);
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
      onChanged(`Paquete ${row.trackingNumber || `de ${unit}`} devuelto`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo marcar como devuelto');
    } finally {
      setBusy(false);
    }
  };

  const receivedText = [pkg?.receivedByName ? `Recibió ${pkg.receivedByName}` : 'Recibido en portería', formatDateTime(row.receivedAt || row.createdAt)].filter(Boolean).join(' · ');

  return (
    <>
      <SidePanel
        open
        onClose={onClose}
        busy={busy}
        eyebrow={`Paquete #${row.id}${row.carrier ? ` · ${row.carrier}` : ''}`}
        title={<span className={`${dsMono} text-[28px] font-semibold tracking-[-.01em]`}>{unit}</span>}
        subtitle={<span className="text-[13px] text-[#4b4a46]">{row.residentName || 'Cualquier residente de la unidad'}</span>}
        status={
          <div className={`${dsMono} flex flex-wrap items-center gap-x-3 gap-y-1 text-xs`}>
            {row.trackingNumber && <span className="text-[#8a8580]">guía {row.trackingNumber}</span>}
            {group === 'pending' ? (
              <span className="font-semibold" style={{ color: daysColor(days) }}>
                {days === 0 ? 'llegó hoy' : `${formatDays(days)} en portería`}
              </span>
            ) : (
              <span className="font-semibold" style={{ color: PACKAGE_GROUP_META[group].color }}>
                {packageStatusLabel(current)}
              </span>
            )}
          </div>
        }
        footer={
          actions.canDeliver ? (
            <>
              <button type="button" className={`${vtBtn.primary} h-11! flex-1 text-sm!`} onClick={deliver} disabled={busy}>
                {busy ? 'Entregando…' : `Confirmar entrega · ${clock}`}
              </button>
              <button type="button" className={`${vtBtn.secondary} h-11! text-[#c8382d]! border-[#c8382d]! hover:bg-[#fbe9e4]!`} onClick={() => setConfirmReturn(true)} disabled={busy}>
                Devolver
              </button>
            </>
          ) : actions.canReturn ? (
            <button type="button" className={`${vtBtn.secondary} h-11! text-[#c8382d]! border-[#c8382d]!`} onClick={() => setConfirmReturn(true)} disabled={busy}>
              Devolver
            </button>
          ) : undefined
        }
      >
        {error && <VtNotice tone="error">{error}</VtNotice>}

        <div className="flex gap-3">
          <div
            className="w-[120px] h-[96px] shrink-0 rounded-lg border-[1.5px] border-dashed border-[#c9c6c0] bg-[#faf9f7] flex items-center justify-center text-[11px] text-[#8a8580] text-center px-2"
            aria-label="Sin foto del paquete"
          >
            Sin foto
          </div>
          <div className="min-w-0 text-[13px] flex flex-col gap-1">
            <div className="font-medium">{row.description || pkg?.description || 'Sin descripción'}</div>
            <div className="text-xs text-[#8a8580]">{receivedText}</div>
            {pkg?.notes && <div className="text-xs text-[#4b4a46] whitespace-pre-wrap">{pkg.notes}</div>}
          </div>
        </div>

        {current.statusCode === 'notified' && (
          <VtNotice tone="info">Este paquete está como notificado: la entrega directa no está habilitada para ese estado.</VtNotice>
        )}

        {actions.canDeliver && (
          <section aria-label="Entregar a">
            <DsEyebrow className="mb-2">Entregar a</DsEyebrow>
            <div role="radiogroup" aria-label="Entregar a" className="flex flex-col gap-1.5">
              {residents.map((r) => (
                <RecipientCard key={r.id} checked={recipient === r.id} onSelect={() => setRecipient(r.id)} title={r.name} sub={[r.residentTypeName, r.dni].filter(Boolean).join(' · ')} />
              ))}
              <RecipientCard checked={recipient === OTHER} onSelect={() => setRecipient(OTHER)} title="Otra persona" sub="nombre y documento" />
              {recipient === OTHER && (
                <div className="grid grid-cols-2 gap-2 pl-1">
                  <div>
                    <label htmlFor={ids.otherName} className={vtLabel}>
                      Nombre
                    </label>
                    <input id={ids.otherName} className={vtInput} value={other.name} onChange={(e) => setOther({ ...other, name: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor={ids.otherDoc} className={vtLabel}>
                      Documento
                    </label>
                    <input id={ids.otherDoc} className={`${vtInput} ${dsMono}`} value={other.doc} onChange={(e) => setOther({ ...other, doc: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
            <label htmlFor={ids.note} className={`${vtLabel} mt-3`}>
              Nota
            </label>
            <textarea id={ids.note} rows={2} className={vtTextarea} placeholder="Observaciones de la entrega" value={note} onChange={(e) => setNote(e.target.value)} />
          </section>
        )}

        {!actions.canDeliver && (
          <PanelSection label="Línea de tiempo">
            {loading && !pkg ? (
              <div className="text-[13px] text-[#8a8580]">Cargando…</div>
            ) : (
              <Timeline steps={packageTimeline({ ...current, notificationSentAt: pkg?.notificationSentAt, notifyResident: pkg?.notifyResident, receivedByName: pkg?.receivedByName })} />
            )}
          </PanelSection>
        )}
      </SidePanel>

      <VtDialog
        open={confirmReturn}
        onClose={() => setConfirmReturn(false)}
        busy={busy}
        layer="over"
        eyebrow="Paquetería"
        title="¿Devolver el paquete?"
        subtitle={`${unit} · ${row.carrier}${row.trackingNumber ? ` ${row.trackingNumber}` : ''}`}
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setConfirmReturn(false)} disabled={busy}>
              No
            </button>
            <button type="button" className={vtBtn.primary} onClick={markReturned} disabled={busy}>
              {busy ? 'Guardando…' : 'Sí, devolver'}
            </button>
          </>
        }
      >
        <p className="m-0 text-[13px] text-[#4b4a46]">Sale de la lista por entregar. No se puede deshacer.</p>
      </VtDialog>
    </>
  );
}

function RecipientCard({ checked, onSelect, title, sub }: { checked: boolean; onSelect: () => void; title: string; sub: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`w-full text-left rounded-lg px-3.5 py-2.5 min-h-11 flex items-center gap-3 border ${checked ? 'border-[#1a1a1a] border-[1.5px]' : 'border-[#e4e2dd] hover:border-[#c9c6c0]'}`}
    >
      <span className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center ${checked ? 'border-[#1a1a1a]' : 'border-[#c9c6c0]'}`} aria-hidden="true">
        {checked && <span className="w-2 h-2 rounded-full bg-[#1a1a1a]" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold truncate">{title}</span>
        <span className="block text-[11px] text-[#8a8580] truncate">{sub}</span>
      </span>
    </button>
  );
}
