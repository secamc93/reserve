/**
 * Z4 · Detalle de reserva en panel lateral (420 px): unidad, fecha, pagos, acceso, línea de
 * tiempo y acciones según el estado (aprobar / rechazar, confirmar, ingreso, salida,
 * cancelar, marcar pagos).
 */

'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DsEyebrow, DsStatus, VtIcon, VtNotice, dsFontRoot, dsMono, vtBtn, vtTextarea } from '@/shared/ui/ds';
import type { CommonAreaReservation, UpdatePaymentsDTO } from '../domain';
import {
  approveReservationAction,
  cancelReservationAction,
  checkInReservationAction,
  checkOutReservationAction,
  confirmReservationAction,
  getReservationByIdAction,
  rejectReservationAction,
  updateReservationPaymentsAction,
} from '../infrastructure/actions';
import type { ActionResult } from '../infrastructure/actions';
import {
  ACTION_LABEL,
  DAY_LONG,
  availableActions,
  formatDateTime,
  formatMoney,
  parseISODate,
  reservationDay,
  reservationTimeline,
  statusMeta,
  unitLabel,
  type ReservationAction,
} from './design';

export interface ReservationPanelProps {
  businessId: number;
  reservationId: number | null;
  getToken: () => Promise<string>;
  onClose: () => void;
  /** Se llama después de cada cambio para refrescar calendario y listas. */
  onChanged: (message: string) => void;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function longDate(value: string): string {
  const d = parseISODate(reservationDay(value));
  return `${DAY_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="py-3.5 border-b border-[#efedea]">
      <DsEyebrow className="mb-1.5">{label}</DsEyebrow>
      {children}
    </section>
  );
}

function PaymentRow({ label, amount, paid, paidAt, onToggle, busy }: { label: string; amount?: number; paid: boolean; paidAt?: string; onToggle: () => void; busy: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="text-[13px]">{label}</div>
        <div className={`${dsMono} text-xs text-[#4b4a46]`}>{formatMoney(amount)}</div>
      </div>
      <DsStatus label={paid ? `Pagado${paidAt ? ` · ${formatDateTime(paidAt)}` : ''}` : 'Pendiente'} color={paid ? '#1f8a4c' : '#c8603f'} />
      <button type="button" className={vtBtn.small} onClick={onToggle} disabled={busy} aria-label={paid ? `Desmarcar ${label.toLowerCase()}` : `Marcar ${label.toLowerCase()} como pagado`}>
        {paid ? 'Desmarcar' : 'Marcar pagado'}
      </button>
    </div>
  );
}

export function ReservationPanel({ businessId, reservationId, getToken, onClose, onChanged }: ReservationPanelProps) {
  const [reservation, setReservation] = useState<CommonAreaReservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonFor, setReasonFor] = useState<'reject' | 'cancel' | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (reservationId === null) return;
    let cancelled = false;
    setReservation(null);
    setError(null);
    setReasonFor(null);
    setReason('');
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const result = await getReservationByIdAction({ token, businessId, id: reservationId });
        if (cancelled) return;
        if (result.success) setReservation(result.data);
        else setError(result.error);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar la reserva');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reservationId, businessId, getToken]);

  useEffect(() => {
    if (reservationId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reservationId, busy, onClose]);

  const run = useCallback(
    async (call: (token: string) => Promise<ActionResult<CommonAreaReservation>>, message: string) => {
      setBusy(true);
      setError(null);
      try {
        const token = await getToken();
        const result = await call(token);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setReservation(result.data);
        setReasonFor(null);
        setReason('');
        onChanged(message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo completar la acción');
      } finally {
        setBusy(false);
      }
    },
    [getToken, onChanged],
  );

  if (reservationId === null) return null;

  const r = reservation;
  const unit = r ? unitLabel(r.propertyUnitNumber, r.propertyUnitBlock) : '';
  const meta = statusMeta(r?.statusCode, r?.statusName);
  const actions = availableActions(r?.statusCode);
  const id = reservationId;

  const doAction = (action: ReservationAction) => {
    if (action === 'reject' || action === 'cancel') {
      setReasonFor(action);
      return;
    }
    const map = {
      approve: [(t: string) => approveReservationAction({ token: t, businessId, id }), `Reserva de ${unit} aprobada`],
      confirm: [(t: string) => confirmReservationAction({ token: t, businessId, id }), `Reserva de ${unit} confirmada`],
      checkIn: [(t: string) => checkInReservationAction({ token: t, businessId, id }), `Ingreso de ${unit} registrado`],
      checkOut: [(t: string) => checkOutReservationAction({ token: t, businessId, id }), `Salida de ${unit} registrada`],
    } as const;
    const [call, message] = map[action];
    run(call, message);
  };

  const submitReason = () => {
    if (reasonFor === 'reject') {
      if (!reason.trim()) {
        setError('Escribe el motivo del rechazo: el residente lo verá.');
        return;
      }
      run((t) => rejectReservationAction({ token: t, businessId, id, reason: reason.trim() }), `Reserva de ${unit} rechazada`);
    } else if (reasonFor === 'cancel') {
      run((t) => cancelReservationAction({ token: t, businessId, id, reason: reason.trim() || undefined }), `Reserva de ${unit} cancelada`);
    }
  };

  const pay = (data: UpdatePaymentsDTO, message: string) => run((t) => updateReservationPaymentsAction({ token: t, businessId, id, data }), message);

  return (
    <>
      <div className="fixed inset-0 z-[54] bg-black/30 md:hidden" onClick={() => !busy && onClose()} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label={r ? `Reserva de ${unit} en ${r.commonAreaName ?? 'la zona'}` : 'Detalle de reserva'}
        className={`${dsFontRoot} fixed inset-y-0 right-0 z-[55] w-full md:w-[420px] bg-white border-l border-[#e4e2dd] shadow-[-8px_0_32px_rgba(0,0,0,.10)] flex flex-col text-[#1a1a1a]`}
      >
        <header className="px-5 pt-5 pb-4 border-b border-[#efedea] flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <DsEyebrow>Reserva · {r?.commonAreaName ?? 'Zona común'}</DsEyebrow>
            <h2 className="m-0 mt-1 text-lg font-semibold tracking-[-.015em]">{r ? unit : 'Cargando…'}</h2>
            {r && (
              <div className="mt-1.5">
                <DsStatus label={meta.label} color={meta.color} />
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar detalle" className="text-[#8a8580] hover:text-[#1a1a1a] max-md:w-11 max-md:h-11 flex items-center justify-center">
            <VtIcon name="close" size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {error && (
            <div className="pt-3.5">
              <VtNotice>{error}</VtNotice>
            </div>
          )}
          {loading && <div className="py-10 text-center text-sm text-[#8a8580]">Cargando…</div>}
          {r && (
            <>
              <Section label="Unidad">
                <div className="text-sm font-semibold">{unit}</div>
                {r.residentName && <div className="text-[13px] text-[#4b4a46]">{r.residentName}</div>}
              </Section>

              <Section label="Fecha y hora">
                <div className="text-sm">{longDate(r.reservationDate)}</div>
                <div className={`${dsMono} text-[13px] text-[#4b4a46]`}>
                  {r.startTime} – {r.endTime}
                  {r.durationHours ? ` · ${r.durationHours} h` : ''}
                </div>
              </Section>

              <Section label="Uso">
                <div className="text-sm">
                  {r.numberOfGuests} {r.numberOfGuests === 1 ? 'persona' : 'personas'}
                </div>
                {r.purpose && <div className="text-[13px] text-[#4b4a46] mt-0.5">{r.purpose}</div>}
                {r.specialRequests && <div className="text-xs text-[#8a8580] mt-1">Solicitud: {r.specialRequests}</div>}
              </Section>

              <Section label="Pagos">
                {!r.totalAmount && !r.depositAmount ? (
                  <div className="text-[13px] text-[#8a8580]">Sin costo</div>
                ) : (
                  <>
                    {r.totalAmount ? (
                      <PaymentRow
                        label="Pago completo"
                        amount={r.totalAmount}
                        paid={r.fullPaymentPaid}
                        paidAt={r.fullPaymentPaidAt}
                        busy={busy}
                        onToggle={() => pay({ fullPaymentPaid: !r.fullPaymentPaid }, r.fullPaymentPaid ? 'Pago desmarcado' : 'Pago registrado')}
                      />
                    ) : null}
                    {r.depositAmount ? (
                      <PaymentRow
                        label="Depósito"
                        amount={r.depositAmount}
                        paid={r.depositPaid}
                        paidAt={r.depositPaidAt}
                        busy={busy}
                        onToggle={() => pay({ depositPaid: !r.depositPaid }, r.depositPaid ? 'Depósito desmarcado' : 'Depósito registrado')}
                      />
                    ) : null}
                  </>
                )}
              </Section>

              {r.accessCode && (
                <Section label="Acceso">
                  <div className="flex items-center gap-2">
                    <span className={`${dsMono} px-2.5 py-1 border-[1.5px] border-[#1a1a1a] rounded-md text-base font-semibold tracking-[.12em]`}>{r.accessCode}</span>
                    <span className="text-xs text-[#8a8580]">Código para portería</span>
                  </div>
                </Section>
              )}

              <Section label="Línea de tiempo">
                <ol className="list-none m-0 p-0 relative">
                  {reservationTimeline(r).map((ev, i, all) => (
                    <li key={`${ev.label}-${i}`} className="relative pl-5 pb-3 last:pb-0">
                      {i < all.length - 1 && <span className="absolute left-[4px] top-3 bottom-0 w-px bg-[#e4e2dd]" aria-hidden="true" />}
                      <span
                        className="absolute left-0 top-1 w-[9px] h-[9px] rounded-full"
                        style={{ background: ev.tone === 'ok' ? '#1f8a4c' : ev.tone === 'danger' ? '#c8382d' : '#8a8580' }}
                        aria-hidden="true"
                      />
                      <div className="text-[13px] font-medium">{ev.label}</div>
                      {ev.at && <div className={`${dsMono} text-[11px] text-[#8a8580]`}>{formatDateTime(ev.at)}</div>}
                      {ev.detail && <div className="text-xs text-[#4b4a46]">{ev.detail}</div>}
                    </li>
                  ))}
                </ol>
              </Section>
            </>
          )}
        </div>

        {r && (actions.length > 0 || reasonFor) && (
          <footer className="px-5 py-4 border-t border-[#efedea] flex flex-col gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {reasonFor ? (
              <>
                <label htmlFor="reservation-reason" className="text-xs font-semibold">
                  {reasonFor === 'reject' ? 'Motivo del rechazo' : 'Motivo de la cancelación (opcional)'}
                </label>
                <textarea id="reservation-reason" rows={2} className={vtTextarea} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} autoFocus />
                <div className="flex gap-2 justify-end">
                  <button type="button" className={vtBtn.secondary} onClick={() => setReasonFor(null)} disabled={busy}>
                    Volver
                  </button>
                  <button type="button" className={`${vtBtn.primary} !bg-[#c8382d]`} onClick={submitReason} disabled={busy}>
                    {reasonFor === 'reject' ? 'Confirmar rechazo' : 'Confirmar cancelación'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 justify-end">
                {actions.includes('cancel') && (
                  <button type="button" className={`${vtBtn.ghost} mr-auto`} onClick={() => doAction('cancel')} disabled={busy}>
                    {ACTION_LABEL.cancel}
                  </button>
                )}
                {actions.includes('reject') && (
                  <button type="button" className={vtBtn.secondary} onClick={() => doAction('reject')} disabled={busy}>
                    {ACTION_LABEL.reject}
                  </button>
                )}
                {actions
                  .filter((a) => a !== 'cancel' && a !== 'reject')
                  .map((a) => (
                    <button key={a} type="button" className={vtBtn.primary} onClick={() => doAction(a)} disabled={busy}>
                      {ACTION_LABEL[a]}
                    </button>
                  ))}
              </div>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}
